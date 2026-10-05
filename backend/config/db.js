const mongoose = require('mongoose');

// Cache the connection so serverless platforms (Vercel) reuse it between requests
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn.connection;
      })
      .catch((error) => {
        connectionPromise = null; // allow a retry on the next request
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (!process.env.VERCEL) process.exit(1); // normal server: stop. Vercel: just fail this request
        throw error;
      });
  }
  return connectionPromise;
};

module.exports = connectDB;
