const Anthropic = require('@anthropic-ai/sdk')

function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch (e) {
    return { ok: false, error: e }
  }
}

function fallbackSuggestion(product, inventory, riskData, salesVelocity) {
  const unitsAtRisk = Math.max(0, Number(inventory?.quantity || 0))
  const estimatedRevenueLoss = unitsAtRisk * Number(product?.unit_price || 0)

  let suggestion_type = 'promote'
  let discount_percent = null
  if (riskData.label === 'Critical' || riskData.days_to_expiry <= 3) {
    suggestion_type = 'discount'
    discount_percent = 25
  } else if (riskData.label === 'High') {
    suggestion_type = 'bundle'
    discount_percent = 15
  } else if (salesVelocity < 0.5) {
    suggestion_type = 'reposition'
  }

  return {
    suggestion_type,
    suggestion_text:
      suggestion_type === 'discount'
        ? `Apply a ${discount_percent}% discount immediately and place ${product.name} at the front of ${inventory.location} to clear stock before expiry.`
        : suggestion_type === 'bundle'
          ? `Bundle ${product.name} with a fast-moving complementary item and run a limited-time in-store offer to increase sell-through.`
          : suggestion_type === 'reposition'
            ? `Reposition ${product.name} to a higher-traffic spot and add a small shelf-talker to improve visibility this week.`
            : `Promote ${product.name} via a small end-cap placement and a weekend push to maintain healthy turnover.`,
    discount_percent,
    confidence: riskData.label === 'Critical' ? 'High' : 'Medium',
    units_at_risk: unitsAtRisk,
    estimated_revenue_loss: Math.round(estimatedRevenueLoss),
    reasoning: `Risk is ${riskData.label} with ${riskData.days_to_expiry} days to expiry and ${riskData.days_to_sellout} days to sell out at ${salesVelocity.toFixed(
      2
    )} units/day.`,
  }
}

async function generateGeminiSuggestion(product, inventory, riskData, salesVelocity) {
  const geminiApiKey = process.env.GEMINI_API_KEY
  if (!geminiApiKey || geminiApiKey === 'your_key_here') {
    return null
  }
  try {
    const endpoint = `https://gemini.googleapis.com/v1/models/chat-bison-001:generate?key=${encodeURIComponent(
      geminiApiKey
    )}`

    const prompt = `You are a retail inventory manager AI. Given the following product data, generate a smart sales suggestion.\n\nProduct: ${product.name} (${product.category})\nStock: ${inventory.quantity} units\nDays to expiry: ${riskData.days_to_expiry}\nSales velocity: ${salesVelocity} units/day\nDays to sell out at current pace: ${riskData.days_to_sellout}\nRisk level: ${riskData.label}\n\nGenerate a JSON response with: {\n  "suggestion_type": "discount" | "bundle" | "promote" | "reposition" | "procurement_alert",\n  "suggestion_text": "clear, actionable 1-2 sentence suggestion",\n  "discount_percent": number or null,\n  "confidence": "High" | "Medium" | "Low",\n  "units_at_risk": number,\n  "estimated_revenue_loss": number,\n  "reasoning": "brief explanation"\n} Only return valid JSON. No extra text.`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'chat-bison-001',
        prompt: {
          messages: [{ role: 'user', content: prompt }],
        },
        max_output_tokens: 500,
      }),
    })

    if (!response.ok) {
      return null
    }

    const json = await response.json()
    const text =
      json?.candidates?.[0]?.content?.[0]?.text ||
      json?.candidates?.[0]?.content ||
      ''

    if (!text) {
      return null
    }

    const parsed = safeJsonParse(text)
    if (!parsed.ok) {
      return null
    }

    return parsed.value
  } catch (e) {
    console.warn('Gemini suggestion failed, falling back:', e.message)
    return null
  }
}

async function generateAISuggestion(product, inventory, riskData, salesVelocity) {
  const geminiResult = await generateGeminiSuggestion(product, inventory, riskData, salesVelocity)
  if (geminiResult) {
    return geminiResult
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_key_here') {
    return fallbackSuggestion(product, inventory, riskData, salesVelocity)
  }

  const client = new Anthropic({ apiKey })

  const prompt = `
You are a retail inventory manager AI. Given the following product data, generate a smart sales suggestion.

Product: ${product.name} (${product.category})
Stock: ${inventory.quantity} units
Days to expiry: ${riskData.days_to_expiry}
Sales velocity: ${salesVelocity} units/day
Days to sell out at current pace: ${riskData.days_to_sellout}
Risk level: ${riskData.label}

Generate a JSON response with:
{
  "suggestion_type": "discount" | "bundle" | "promote" | "reposition" | "procurement_alert",
  "suggestion_text": "clear, actionable 1-2 sentence suggestion",
  "discount_percent": number or null,
  "confidence": "High" | "Medium" | "Low",
  "units_at_risk": number,
  "estimated_revenue_loss": number,
  "reasoning": "brief explanation"
}
Only return valid JSON. No extra text.
  `.trim()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response?.content?.[0]?.text || ''
  const parsed = safeJsonParse(text)
  if (!parsed.ok) {
    return fallbackSuggestion(product, inventory, riskData, salesVelocity)
  }
  return parsed.value
}

module.exports = { generateAISuggestion }

