import dns from 'dns';
// Force Node.js to use Google DNS for resolving Mongo SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  console.log('Connecting to remote MongoDB with custom DNS...');
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Success: Connected to MongoDB Atlas successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error: Could not connect to remote MongoDB Atlas database.');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
