import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.mongo || '';
    if (!mongoURI) {
      throw new Error('Mongo URI not found in .env');
    }
    
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    // process.exit(1); // Don't exit process in dev mode, maybe just log error
  }
};

export default connectDB;
