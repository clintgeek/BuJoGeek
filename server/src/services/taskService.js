import Task from '../models/Task.js';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';

class TaskService {
  constructor() {
    this.taskModel = Task;
  }

  /**
   * Convert a date to UTC for MongoDB queries
   * @param {Date} date - The date to convert
   * @returns {Date} UTC date
   */
  getUtcDate(date) {
    const d = new Date(date);
    return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  }

  /**
   * Get tasks for a specific date range
   * @param {Object} params - Query parameters
   * @param {string} params.userId - User ID
   * @param {Date} params.startDate - Start date
   * @param {Date} params.endDate - End date
   * @param {string} params.viewType - View type (daily, weekly, monthly, all)
   * @returns {Promise<Array>} Array of tasks
   */
  async getTasksForDateRange({ userId, startDate, endDate, viewType }) {
    const query = {
      createdBy: userId,
      isBacklog: false
    };

    // Convert input date to UTC
    const utcDate = this.getUtcDate(startDate);
    const utcYear = utcDate.getUTCFullYear();
    const utcMonth = utcDate.getUTCMonth();
    const utcDay = utcDate.getUTCDate();

    // Create start and end of day in UTC
    const startOfDayDate = new Date(Date.UTC(utcYear, utcMonth, utcDay, 0, 0, 0, 0));
    const endOfDayDate = new Date(Date.UTC(utcYear, utcMonth, utcDay, 23, 59, 59, 999));

    // Add date range based on view type
    switch (viewType) {
      case 'daily':
        query.$or = [
          // 1. Tasks due on this day (regardless of status)
          {
            dueDate: {
              $gte: startOfDayDate,
              $lte: endOfDayDate
            }
          },
          // 2. Tasks completed on this day that were either due today or had no due date
          {
            status: 'completed',
            updatedAt: {
              $gte: startOfDayDate,
              $lte: endOfDayDate
            },
            $or: [
              { dueDate: { $gte: startOfDayDate, $lte: endOfDayDate } },
              { dueDate: null }
            ]
          },
          // 3. Incomplete, unscheduled tasks created on or before this day (rolling forward)
          {
            dueDate: null,
            status: 'pending',
            createdAt: {
              $lte: endOfDayDate
            }
          }
        ];
        break;
      case 'weekly':
        // Get start of week (Sunday) in UTC
        const startOfWeekDate = new Date(Date.UTC(utcYear, utcMonth, utcDay - utcDate.getUTCDay(), 0, 0, 0, 0));
        const endOfWeekDate = new Date(startOfWeekDate);
        endOfWeekDate.setUTCDate(endOfWeekDate.getUTCDate() + 6);
        endOfWeekDate.setUTCHours(23, 59, 59, 999);

        query.$or = [
          // 1. Tasks due this week (regardless of status)
          {
            dueDate: {
              $gte: startOfWeekDate,
              $lte: endOfWeekDate
            }
          },
          // 2. Tasks completed this week
          {
            status: 'completed',
            updatedAt: {
              $gte: startOfWeekDate,
              $lte: endOfWeekDate
            }
          },
          // 3. Incomplete, unscheduled tasks created on or before the end of this week
          {
            dueDate: null,
            status: 'pending',
            createdAt: {
              $lte: endOfWeekDate
            }
          }
        ];
        break;
      case 'monthly':
        // Get start of month in UTC
        const startOfMonthDate = new Date(Date.UTC(utcYear, utcMonth, 1, 0, 0, 0, 0));
        const endOfMonthDate = new Date(Date.UTC(utcYear, utcMonth + 1, 0, 23, 59, 59, 999));

        query.$or = [
          // 1. Tasks due in this month (regardless of status)
          {
            dueDate: {
              $gte: startOfMonthDate,
              $lte: endOfMonthDate
            }
          },
          // 2. Tasks completed in this month (regardless of due date)
          {
            status: 'completed',
            updatedAt: {
              $gte: startOfMonthDate,
              $lte: endOfMonthDate
            }
          },
          // 3. Incomplete, unscheduled tasks created on or before the end of this month (rolling forward)
          {
            dueDate: null,
            status: 'pending',
            createdAt: {
              $lte: endOfMonthDate
            }
          }
        ];
        break;
      case 'all':
        // For 'all' view, we want to group tasks by their relevant dates
        query.$or = [
          // 1. All tasks with due dates
          {
            dueDate: { $ne: null }
          },
          // 2. All completed tasks
          {
            status: 'completed'
          },
          // 3. Incomplete, unscheduled tasks
          {
            dueDate: null,
            status: 'pending'
          }
        ];
        break;
      default:
        throw new Error('Invalid view type');
    }

    const tasks = await this.taskModel.find(query)
      .populate('parentTask', 'content status')
      .sort({
        status: 1, // pending first
        dueDate: -1, // newest scheduled tasks first
        priority: 1, // high priority first
        createdAt: -1 // newest first
      });

    // Convert to plain objects
    const tasksWithDates = tasks.map(task => task.toObject());

    // Ensure we always return an array
    return Array.isArray(tasksWithDates) ? this.sortTasks(tasksWithDates, viewType) : [];
  }

  /**
   * Sort tasks according to the sorting rules
   * @param {Array} tasks - Array of tasks to sort
   * @param {string} viewType - View type
   * @returns {Array} Sorted tasks
   */
  sortTasks(tasks, viewType) {
    return tasks.sort((a, b) => {
      // First, sort by completion status
      if (a.status !== b.status) {
        return a.status === 'pending' ? -1 : 1;
      }

      // Then, sort by scheduled date
      if (a.dueDate && b.dueDate) {
        return a.dueDate - b.dueDate;
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;

      // Finally, sort by priority
      if (a.priority !== b.priority) {
        return (b.priority || 0) - (a.priority || 0);
      }

      return 0;
    });
  }

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} Created task
   */
  async createTask(taskData) {
    const task = new this.taskModel(taskData);
    return task.save();
  }

  /**
   * Update a task
   * @param {string} taskId - Task ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated task
   */
  async updateTask(taskId, updateData) {
    return this.taskModel.findByIdAndUpdate(
      taskId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
  }

  /**
   * Delete a task
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTask(taskId) {
    const task = await this.taskModel.findById(taskId);
    if (!task) return null;

    // Remove from parent's subtasks if exists
    if (task.parentTask) {
      await this.taskModel.findByIdAndUpdate(task.parentTask, {
        $pull: { subtasks: taskId }
      });
    }

    // Delete all subtasks
    await this.taskModel.deleteMany({ parentTask: taskId });

    // Delete the task itself
    return this.taskModel.findByIdAndDelete(taskId);
  }

  /**
   * Update task status
   * @param {string} taskId - Task ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated task
   */
  async updateTaskStatus(taskId, status) {
    const now = new Date();
    const updateData = {
      status,
      updatedAt: now
    };

    // Set or clear completedAt based on status
    if (status === 'completed') {
      updateData.completedAt = now;
    } else {
      updateData.completedAt = null;  // Clear completedAt if task is uncompleted
    }

    return this.taskModel.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  /**
   * Get a task by ID
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} Task object
   */
  async getTaskById(taskId) {
    return this.taskModel.findById(taskId)
      .populate('parentTask', 'content status')
      .populate('subtasks');
  }
}

export default new TaskService();