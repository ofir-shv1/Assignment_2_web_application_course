import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import postRoutes from './routes/postRoutes';
import commentRoute from './routes/commentRoute';
import userRoutes from './routes/userRoute';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoute);
app.use('/users', userRoutes);

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
