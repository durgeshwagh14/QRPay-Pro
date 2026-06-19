import mongoose from 'mongoose';
import { env } from './env.js';
import { User } from '../models/User.js';
import { Business } from '../models/Business.js';
import { hashPassword } from '../utils/auth.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    await seedAdmin();
  } catch (error) {
    console.error(`❌ MongoDB connection error:`, error);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin@';
    const hashedPassword = await hashPassword(adminPassword);

    // Delete any old super admin accounts with different emails
    await User.deleteMany({ role: 'super_admin', email: { $ne: adminEmail } });

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        email: adminEmail,
        password: hashedPassword,
        ownerName: 'Super Admin',
        mobile: '9999999999',
        role: 'super_admin',
        isEmailVerified: true,
        isMobileVerified: true,
      });

      await Business.create({
        ownerId: admin._id,
        name: 'QRPay Pro HQ',
        upiIds: ['admin@upi'],
        gstin: '27AAAAA1111A1Z1',
      });

      console.log('📡 [Seed] Default Super Admin seeded successfully!');
    } else {
      // Force update the password/role in case the database was already seeded
      admin.password = hashedPassword;
      admin.role = 'super_admin';
      await admin.save();
      console.log('📡 [Seed] Default Super Admin credentials verified/updated!');
    }
  } catch (error) {
    console.error('❌ Failed to seed default admin:', error);
  }
};
