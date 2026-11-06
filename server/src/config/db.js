import mongoose from 'mongoose';

export const connectDB = async (uri = process.env.MONGODB_URI) => {
  try {
    const mongoUri = uri || 'mongodb://localhost:27017/blogsystem';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    process.exit(1);
  }
};
