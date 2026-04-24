import { Router } from 'express';
import { createDeal, updateDealStage, getDeals } from '../controllers/dealController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/cloudinary.js';

const router = Router();

// 1. Add GET route to fetch deals for the Kanban board
router.get('/', authenticate, getDeals);

// 2. Create deal
router.post('/', authenticate, authorize(['ADMIN', 'AGENT']), upload.array('documents'), createDeal);

// 3. Update stage (Updated path to include /stage to match frontend api.patch call)
router.patch('/:id/stage', authenticate, authorize(['ADMIN', 'AGENT']), upload.array('documents'), updateDealStage);

export default router;