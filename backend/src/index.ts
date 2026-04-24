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

app.use(cors());
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/settings', settingsRoutes);

const PORT = process.env.PORT || 5000;

// ONLY START THE SERVER IF NOT IN TESTING MODE
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;