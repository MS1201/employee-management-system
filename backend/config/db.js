const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.warn('⚠️ MONGODB_URI or MONGO_URI is not defined in backend/.env. Server running without DB connection.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    if (error.message.includes('authentication failed')) {
      console.error('💡 Hint: Please check your MongoDB Atlas username and password in backend/.env.');
    } else if (error.message.includes('whitelist') || error.message.includes('selection timed out')) {
      console.error('💡 Hint: Please ensure Network Access in MongoDB Atlas has 0.0.0.0/0 (Allow access from anywhere) enabled.');
    }
  }
};

module.exports = connectDB;
