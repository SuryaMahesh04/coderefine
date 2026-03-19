import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function test() {
    const uri = process.env.MONGODB_URI;
    console.log("Starting test...");
    if (!uri) {
        console.error("No URI found in .env.local");
        process.exit(1);
    }
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("SUCCESS");
        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("FAILURE:", err.message);
        process.exit(1);
    }
}

test();
