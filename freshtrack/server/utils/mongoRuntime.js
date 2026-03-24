const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mem = null

async function connectMongo({ preferUri } = {}) {
  const envUri = process.env.MONGODB_URI
  const uri = preferUri || envUri

  if (uri && uri !== 'memory') {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 })
      return {
        uri,
        mode: 'external',
        close: async () => {
          await mongoose.disconnect()
        },
      }
    } catch (e) {
      // If external Mongo isn't reachable, fall back to in-memory for demo usability.
      try {
        await mongoose.disconnect()
      } catch {}
    }
  }

  mem = await MongoMemoryServer.create({
    instance: { dbName: 'freshtrack' },
  })
  const memUri = mem.getUri()
  await mongoose.connect(memUri)

  return {
    uri: memUri,
    mode: 'memory',
    close: async () => {
      await mongoose.disconnect()
      if (mem) await mem.stop()
      mem = null
    },
  }
}

module.exports = { connectMongo }

