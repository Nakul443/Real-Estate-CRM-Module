import { Router } from 'express';
import { 
  createTask, 
  getMyTasks, 
  toggleTaskStatus, 
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', authenticate, createTask);
router.get('/', authenticate, getMyTasks);
router.patch('/:id/status', authenticate, toggleTaskStatus);
router.patch('/:id', authenticate, updateTask);
router.delete('/:id', authenticate, deleteTask); // Add this line

export default router;