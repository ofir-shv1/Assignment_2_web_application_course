import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './routes/postRoutes';
import commentRoute from './routes/commentRoute';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/posts', postRoutes);
app.use('/comments', commentRoute);

const mongoUri = process.env.DB_URI || '';

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

export default app;
