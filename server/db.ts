import 'dotenv/config';
import mongoose from 'mongoose';
import { Contact, User, PortfolioContent } from '@shared/schema';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/portfolio';

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI or DATABASE_URL must be set. Please provide a MongoDB connection string.",
  );
}

// Contact Model
const contactSchema = new mongoose.Schema<Contact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// User Model
const userSchema = new mongoose.Schema<User>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Portfolio Content Model
const portfolioContentSchema = new mongoose.Schema<PortfolioContent>({
  heroTitle: { type: String, required: true },
  heroSubtitle: { type: String, required: true },
  heroDescription: { type: String, required: true },
  aboutText: { type: String, required: true },
  skillsList: { type: String, required: true },
  projectsList: { type: String, required: true },
  profileImage: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

// Export models
export const ContactModel = mongoose.model<Contact>('Contact', contactSchema);
export const UserModel = mongoose.model<User>('User', userSchema);
export const PortfolioContentModel = mongoose.model<PortfolioContent>('PortfolioContent', portfolioContentSchema);

// Database connection function
export async function connectDB() {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        maxPoolSize: 10,
      });
      console.log('Connected to MongoDB successfully');
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.error('Please ensure:');
    console.error('1. Your MongoDB connection string is correct');
    console.error('2. Your IP address is whitelisted in MongoDB Atlas (if using Atlas)');
    console.error('3. Your database credentials are valid');
    // Don't throw the error to prevent the server from crashing
    // The application will fall back to default values when database is unavailable
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});