const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    // If you have a MONGO_URI in your .env, it tries to connect to it.
    // If the network blocks it, it falls back to the memory server.
    const dbUri = process.env.MONGO_URI;

    if (dbUri) {
      console.log("Attempting to connect to MongoDB Atlas...");
      await mongoose.connect(dbUri);
      console.log(`🌐 MongoDB Connected Successfully to Atlas`);
    } else {
      throw new Error("No URI provided");
    }
  } catch (error) {
    console.log("⚠️ Atlas unreachable, starting Local Memory Database...");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`🌐 MongoDB Connected Successfully to Memory Instance`);
  }
};

module.exports = connectDB;