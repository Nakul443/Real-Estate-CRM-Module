import { Router } from 'express';
import { createDeal, updateDealStage } from '../controllers/dealController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Admins and Agents can manage deals
router.post('/', authenticate, authorize(['ADMIN', 'AGENT']), createDeal);
router.patch('/:id', authenticate, authorize(['ADMIN', 'AGENT']), updateDealStage);

export default router;