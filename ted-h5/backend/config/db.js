const mongoose = require('mongoose')

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI
    if (uri) {
      await mongoose.connect(uri)
      console.log('MongoDB connected:', uri)
    } else {
      // Use in-memory MongoDB for development
      const { MongoMemoryServer } = require('mongodb-memory-server')
      const mongod = await MongoMemoryServer.create()
      const memUri = mongod.getUri()
      await mongoose.connect(memUri)
      console.log('MongoDB Memory Server started:', memUri)
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    process.exit(1)
  }
}

module.exports = connectDB