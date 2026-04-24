// backend/src/index.ts

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js'; 
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'https://your-frontend-name.vercel.app', // Your actual Vercel URL
  credentials: true
}));
app.use(express.json()); 

// Root route for easy verification
app.get('/', (req, res) => {
  res.send('Real Estate CRM API is Running');
});

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/settings', settingsRoutes);

const PORT = Number(process.env.PORT) || 5000;

// Force start the server unless explicitly in test mode
if (process.env.NODE_ENV !== 'test') {
  // Added '0.0.0.0' for Docker networking compatibility
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
  });
}

export default app;