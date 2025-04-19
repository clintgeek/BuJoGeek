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
  getYearlyTasks,
  getBacklogTasks,
  migrateTaskToBacklog,
  migrateTaskToFuture,
  carryForwardTask,
  getAllTasks
} from '../controllers/taskController.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Base route: /api/tasks

// Get all tasks in chronological order (must come before /:id routes)
router.get('/all', getAllTasks);

// Time-based views
router.get('/daily', getDailyTasks);
router.get('/weekly', getWeeklyTasks);
router.get('/monthly', getMonthlyTasks);
router.get('/yearly', getYearlyTasks);

// Backlog routes
router.get('/backlog', getBacklogTasks);

// Task CRUD operations
router.post('/', createTask);
router.get('/', getTasks);

// Task-specific operations
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/status', updateTaskStatus);
router.post('/:id/subtasks', addSubtask);

// Migration routes
router.post('/:id/migrate-back', migrateTaskToBacklog);
router.post('/:id/migrate-future', migrateTaskToFuture);
router.post('/:id/carry-forward', carryForwardTask);

export default router;