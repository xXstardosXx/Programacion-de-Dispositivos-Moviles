import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/recetas_app';

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log('MongoDB conectado correctamente');
};

export const isDbConnected = (): boolean => mongoose.connection.readyState === 1;
