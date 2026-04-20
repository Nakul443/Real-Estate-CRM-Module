import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js'; // Import your new routes

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Essential for parsing JSON bodies

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});