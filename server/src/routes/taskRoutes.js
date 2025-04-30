import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addSubtask,
  getDailyTasks,
  getWeeklyTasks,
  getMonthlyTasks,
  getAllTasks,
  migrateTaskToFuture
} from '../controllers/taskController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Base route: /api/tasks

// Get tasks for specific views
router.get('/all', getAllTasks);
router.get('/daily', getDailyTasks);
router.get('/weekly', getWeeklyTasks);
router.get('/monthly', getMonthlyTasks);

// Task CRUD operations
router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateTaskStatus);
router.post('/:id/subtasks', addSubtask);
router.post('/:id/migrate-future', migrateTaskToFuture);

export default router;