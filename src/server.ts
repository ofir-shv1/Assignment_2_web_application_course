import dotenv from 'dotenv';
import app, { connectDB } from './index';

dotenv.config();

const PORT = process.env.PORT || 3000;

const initApplication = async (): Promise<void> => {
    try {
        await connectDB();
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
            console.log(`📥 Download API spec: http://localhost:${PORT}/api-docs.json`);
        });
    } catch (error) {
        console.error('Failed to initialize application:', error);
        process.exit(1);
    }
};

initApplication();
