import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// Define User Schema inline for checking
const UserSchema = new mongoose.Schema({
  email: String,
  ownerName: String,
  role: String,
});
const User = mongoose.model('User', UserSchema);

async function checkUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    const users = await User.find({});
    console.log('--- USER LIST IN DATABASE ---');
    users.forEach((u) => {
      console.log(`- Name: ${u.ownerName} | Email: ${u.email} | Role: ${u.role}`);
    });
    console.log('-----------------------------');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

checkUsers();
