const mongoose = require('mongoose')

async function connectMongo() {
  const uri = process.env.MONGO_URI

  if (!uri) {
    throw new Error("MONGO_URI not found")
  }

  await mongoose.connect(uri)
  console.log("✅ Connected to MongoDB Atlas")

  return { mode: 'atlas' }
}

module.exports = { connectMongo }