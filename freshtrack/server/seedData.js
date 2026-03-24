const Product = require('./models/Product')
const Inventory = require('./models/Inventory')
const SalesHistory = require('./models/SalesHistory')
const Alert = require('./models/Alert')
const SuggestionLog = require('./models/SuggestionLog')

const locations = ['Shelf A', 'Warehouse', 'Aisle 3', 'Aisle 1', 'Cold Room']
const segments = ['Walk-in', 'Online', 'Wholesale', 'Premium', 'Budget']

function d(daysFromToday) {
  const dt = new Date()
  dt.setHours(0, 0, 0, 0)
  dt.setDate(dt.getDate() + daysFromToday)
  return dt
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pad(n, width = 2) {
  return String(n).padStart(width, '0')
}

function mkBarcode(i) {
  return `890${pad(i, 10)}`
}

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100
}

function buildProducts() {
  const list = [
    { name: 'Amul Full Cream Milk 1L', category: 'Dairy', brand: 'Amul', shelf_life_days: 10, unit_price: 68 },
    { name: 'Amul Butter 100g', category: 'Dairy', brand: 'Amul', shelf_life_days: 180, unit_price: 62 },
    { name: 'Mother Dairy Curd 400g', category: 'Dairy', brand: 'Mother Dairy', shelf_life_days: 14, unit_price: 45 },
    { name: 'Nestle Slim Milk 1L', category: 'Dairy', brand: 'Nestle', shelf_life_days: 10, unit_price: 76 },
    { name: 'Britannia Cheese Slices 200g', category: 'Dairy', brand: 'Britannia', shelf_life_days: 120, unit_price: 145 },
    { name: 'Britannia Brown Bread 400g', category: 'Bakery', brand: 'Britannia', shelf_life_days: 5, unit_price: 55 },
    { name: 'Harvest Gold White Bread 400g', category: 'Bakery', brand: 'Harvest Gold', shelf_life_days: 5, unit_price: 50 },
    { name: 'Modern Multigrain Bread 400g', category: 'Bakery', brand: 'Modern', shelf_life_days: 6, unit_price: 60 },
    { name: 'Britannia Fruit Cake 200g', category: 'Bakery', brand: 'Britannia', shelf_life_days: 90, unit_price: 75 },
    { name: 'Banana Robusta 1kg', category: 'Produce', brand: 'Farm Fresh', shelf_life_days: 6, unit_price: 48 },
    { name: 'Tomato Hybrid 1kg', category: 'Produce', brand: 'Farm Fresh', shelf_life_days: 7, unit_price: 42 },
    { name: 'Potato 1kg', category: 'Produce', brand: 'Farm Fresh', shelf_life_days: 30, unit_price: 35 },
    { name: 'Apple Shimla 1kg', category: 'Produce', brand: 'Himalayan Orchards', shelf_life_days: 25, unit_price: 165 },
    { name: 'Spinach Palak 250g', category: 'Produce', brand: 'Green Basket', shelf_life_days: 4, unit_price: 28 },
    { name: 'Tropicana Orange Juice 1L', category: 'Beverages', brand: 'Tropicana', shelf_life_days: 180, unit_price: 120 },
    { name: 'Coca-Cola 750ml', category: 'Beverages', brand: 'Coca-Cola', shelf_life_days: 270, unit_price: 45 },
    { name: 'Bisleri Mineral Water 1L', category: 'Beverages', brand: 'Bisleri', shelf_life_days: 365, unit_price: 20 },
    { name: 'Paper Boat Aam Panna 200ml', category: 'Beverages', brand: 'Paper Boat', shelf_life_days: 240, unit_price: 35 },
    { name: 'Red Bull Energy Drink 250ml', category: 'Beverages', brand: 'Red Bull', shelf_life_days: 365, unit_price: 125 },
    { name: 'McCain French Fries 750g', category: 'Frozen', brand: 'McCain', shelf_life_days: 365, unit_price: 235 },
    { name: 'ITC Master Chef Veg Momos 400g', category: 'Frozen', brand: 'ITC', shelf_life_days: 270, unit_price: 170 },
    { name: 'Prasuma Chicken Nuggets 500g', category: 'Frozen', brand: 'Prasuma', shelf_life_days: 270, unit_price: 320 },
    { name: 'Kwality Walls Vanilla Ice Cream 700ml', category: 'Frozen', brand: 'Kwality Walls', shelf_life_days: 365, unit_price: 210 },
    { name: 'Lay’s Classic Salted 52g', category: 'Snacks', brand: 'Lay’s', shelf_life_days: 150, unit_price: 20 },
    { name: 'Kurkure Masala Munch 90g', category: 'Snacks', brand: 'Kurkure', shelf_life_days: 150, unit_price: 25 },
    { name: 'Haldiram’s Bhujia Sev 200g', category: 'Snacks', brand: 'Haldiram’s', shelf_life_days: 270, unit_price: 85 },
    { name: 'Parle-G Biscuits 800g', category: 'Snacks', brand: 'Parle', shelf_life_days: 300, unit_price: 85 },
    { name: 'Cadbury Dairy Milk 52g', category: 'Snacks', brand: 'Cadbury', shelf_life_days: 270, unit_price: 45 },
  ]

  return list.map((p, idx) => ({
    ...p,
    barcode: mkBarcode(idx + 1),
    unit_price: roundMoney(p.unit_price),
  }))
}

function expiryBuckets() {
  return [
    ...[-12, -8, -3, -1],
    ...[1, 2, 3, 5, 6, 7],
    ...[9, 11, 13, 15, 18, 21, 24, 26, 28, 30],
    ...[45, 60, 75, 90, 120, 150, 180, 210],
  ]
}

function velocityProfileFor(product) {
  if (product.category === 'Produce') return { min: 6, max: 18 }
  if (product.name.includes('Milk')) return { min: 10, max: 25 }
  if (product.name.includes('Bread')) return { min: 8, max: 18 }
  if (product.category === 'Frozen') return { min: 1, max: 6 }
  if (product.category === 'Beverages') return { min: 3, max: 10 }
  return { min: 1, max: 8 }
}

async function seedDatabase() {
  await Promise.all([
    Product.deleteMany({}),
    Inventory.deleteMany({}),
    SalesHistory.deleteMany({}),
    Alert.deleteMany({}),
    SuggestionLog.deleteMany({}),
  ])

  const products = await Product.insertMany(buildProducts())

  const bucketDays = expiryBuckets()
  const inventoryDocs = []
  let bucketIdx = 0

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const batchCount = i < 17 ? 2 : 1 // 45 total
    for (let b = 0; b < batchCount; b++) {
      const daysToExpiry = bucketDays[bucketIdx % bucketDays.length]
      bucketIdx++
      const expiryDate = d(daysToExpiry)
      const mfgOffset = -randInt(2, Math.max(3, Math.min(product.shelf_life_days - 1, 60)))
      const mfgDate = new Date(expiryDate)
      mfgDate.setDate(mfgDate.getDate() + mfgOffset)

      const baseQty =
        product.category === 'Produce'
          ? randInt(40, 120)
          : product.category === 'Dairy'
            ? randInt(30, 90)
            : product.category === 'Bakery'
              ? randInt(25, 70)
              : product.category === 'Frozen'
                ? randInt(10, 35)
                : randInt(20, 80)

      inventoryDocs.push({
        product_id: product._id,
        batch_no: `B${pad(i + 1, 2)}-${pad(b + 1, 2)}-${randInt(100, 999)}`,
        quantity: baseQty,
        mfg_date: mfgDate,
        expiry_date: expiryDate,
        location: pick(locations),
      })
    }
  }

  await Inventory.insertMany(inventoryDocs)

  const salesDocs = []
  const today = d(0)
  for (const product of products) {
    const profile = velocityProfileFor(product)
    const baseDaily = randInt(profile.min, profile.max)
    const isSlow = product.category === 'Frozen' || product.name.includes('Bhujia')
    const activityChance = isSlow ? 0.45 : 0.8

    for (let day = 0; day < 90; day++) {
      if (Math.random() > activityChance) continue
      const saleDate = new Date(today)
      saleDate.setDate(saleDate.getDate() - day)
      const noise = randInt(-Math.floor(baseDaily / 3), Math.floor(baseDaily / 2))
      const qty = Math.max(0, baseDaily + noise)
      if (qty === 0) continue

      const discount = Math.random() < 0.12 ? randInt(5, 20) : 0
      const price = roundMoney(product.unit_price * (1 - discount / 100))

      salesDocs.push({
        product_id: product._id,
        quantity_sold: qty,
        sale_date: saleDate,
        customer_segment: pick(segments),
        price,
      })
    }
  }

  while (salesDocs.length > 950) salesDocs.pop()
  await SalesHistory.insertMany(salesDocs)

  const summary = {
    products: await Product.countDocuments({}),
    inventoryBatches: await Inventory.countDocuments({}),
    salesRecords: await SalesHistory.countDocuments({}),
    alerts: await Alert.countDocuments({}),
    suggestionsLog: await SuggestionLog.countDocuments({}),
  }

  return summary
}

module.exports = { seedDatabase }

