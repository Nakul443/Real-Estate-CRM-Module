import { Router } from 'express';
import { createClient, getClients } from '../controllers/clientController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Admins and Agents can manage clients
router.post('/', authenticate, authorize(['ADMIN', 'AGENT']), createClient);
router.get('/', authenticate, getClients);

export default router;