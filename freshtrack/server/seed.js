require('dotenv').config()

const { connectMongo } = require('./utils/mongoRuntime')
const { seedDatabase } = require('./seedData')

async function seed() {
  const conn = await connectMongo()
  const summary = await seedDatabase()

  console.log(
    `✅ Seeded ${summary.products} products, ${summary.inventoryBatches} inventory batches, ${summary.salesRecords} sales records`
  )

  await conn.close()
}

seed().catch(async (e) => {
  console.error('❌ Seed failed', e)
  process.exit(1)
})

