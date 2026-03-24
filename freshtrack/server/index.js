require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { connectMongo } = require('./utils/mongoRuntime')
const { seedDatabase } = require('./seedData')

const dashboardRoutes = require('./routes/dashboard')
const expiryRoutes = require('./routes/expiry')
const suggestionsRoutes = require('./routes/suggestions')
const alertsRoutes = require('./routes/alerts')
const analyticsRoutes = require('./routes/analytics')

const app = express()

app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'freshtrack', time: new Date().toISOString() })
})


app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use('/api/freshtrack', dashboardRoutes)
app.use('/api/freshtrack', expiryRoutes)
app.use('/api/freshtrack', suggestionsRoutes)
app.use('/api/freshtrack', alertsRoutes)
app.use('/api/freshtrack', analyticsRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({
    error: 'internal_error',
    message: err?.message || 'Unexpected server error',
  })
})

async function start() {
  const conn = await connectMongo()
  if (conn.mode === 'memory') {
    const summary = await seedDatabase()
    console.log(
      `✅ (In-memory) Seeded ${summary.products} products, ${summary.inventoryBatches} inventory batches, ${summary.salesRecords} sales records`
    )
  }
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

start().catch((e) => {
  console.error('❌ Failed to start server', e)
  process.exit(1)
})

