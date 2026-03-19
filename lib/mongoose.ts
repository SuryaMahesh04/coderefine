import mongoose from "mongoose";
import dns from "node:dns";

// Force Node.js to use Google's Public DNS to bypass local/router DNS resolution failures
// which often cause "querySrv ECONNREFUSED" or shard host resolution failures.
if (process.env.NODE_ENV === "development") {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// @ts-ignore
let cached = global.mongoose;

if (!cached) {
  // @ts-ignore
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(retryCount = 0) {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10s instead of default 30s for faster failover
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 to avoid IPv6 resolution delays/failures
    };

    console.log(`[MongoDB] Connecting to cluster (Attempt ${retryCount + 1})...`);
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("[MongoDB] Connection established successfully.");
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    
    if (retryCount < 2) {
      console.warn(`[MongoDB] Connection failed: ${e instanceof Error ? e.message : 'Unknown error'}. Retrying in 2s...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return connectDB(retryCount + 1);
    }
    
    console.error("[MongoDB] Max retries reached. Failing connection.");
    throw e;
  }

  return cached.conn;
}

export default connectDB;
