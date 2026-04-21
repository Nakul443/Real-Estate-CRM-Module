import { Router } from 'express';
import { createDeal, updateDealStage } from '../controllers/dealController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/cloudinary.js'; // Import your cloudinary utility

const router = Router();

// Admins and Agents can manage deals
// Added upload.array('documents') to handle the file uploads 
router.post('/', authenticate, authorize(['ADMIN', 'AGENT']), upload.array('documents'), createDeal);
router.patch('/:id', authenticate, authorize(['ADMIN', 'AGENT']), upload.array('documents'), updateDealStage);

export default router;