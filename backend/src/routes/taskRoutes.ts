import { Router } from 'express';
import { createTask, getMyTasks, toggleTaskStatus } from '../controllers/taskController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createTask);
router.get('/', authenticate, getMyTasks);
router.patch('/:id/status', authenticate, toggleTaskStatus);

export default router;