import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import templateRoutes from './src/routes/templateRoutes.js';
import journalRoutes from './src/routes/journalRoutes.js';
import taskRoutes from './src/routes/taskRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the client build directory
app.use(express.static(path.join(__dirname, '../client/dist')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/tasks', taskRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB at:', process.env.DB_URI?.replace(/:\/\/(.*)@/, '://******:******@'));

    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create database if it doesn't exist (MongoDB creates it automatically)
    console.log('MongoDB connected');
    console.log('Using database:', mongoose.connection.db.databaseName);

  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Basic routes
app.get('/', (req, res) => {
  res.json({ message: 'BuJoGeek API is running' });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});