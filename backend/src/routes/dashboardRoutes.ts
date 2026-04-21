import { Router } from 'express';
import { getAdminStats } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Only Admins and Managers should see the full financial reports
router.get('/stats', authenticate, authorize(['ADMIN', 'MANAGER']), getAdminStats);

export default router;