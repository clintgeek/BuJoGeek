import Task from '../models/Task.js';
import { handleError } from '../utils/errorHandler.js';
import { getTasksForDates } from '../utils/taskUtils.js';
import { format } from 'date-fns';

// Create a new task
export const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id
    };

    // If custom dates are provided, use them
    if (req.body.createdAt) {
      taskData.createdAt = new Date(req.body.createdAt);
    }
    if (req.body.dueDate) {
      taskData.dueDate = new Date(req.body.dueDate);
    }
    if (req.body.updatedAt) {
      taskData.updatedAt = new Date(req.body.updatedAt);
    }

    const task = new Task(taskData);
    await task.save();

    res.status(201).json(task);
  } catch (error) {
    handleError(res, error);
  }
};

// Get all tasks with filtering
export const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      signifier,
      tags,
      dueDate,
      search
    } = req.query;

    const query = {
      createdBy: req.user._id // Will be set by auth middleware later
    };

    // Add filters if provided
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (signifier) query.signifier = signifier;
    if (tags) query.tags = { $in: tags.split(',') };
    if (dueDate) {
      const date = new Date(dueDate);
      query.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    const tasks = await Task.find(query)
      .populate('parentTask', 'content status')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    handleError(res, error);
  }
};

// Get a single task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id // Will be set by auth middleware later
    }).populate('parentTask subtasks');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    handleError(res, error);
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id // Will be set by auth middleware later
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    handleError(res, error);
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id // Will be set by auth middleware later
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Remove this task from parent's subtasks if it has a parent
    if (task.parentTask) {
      await Task.findByIdAndUpdate(task.parentTask, {
        $pull: { subtasks: task._id }
      });
    }

    // Delete all subtasks
    await Task.deleteMany({
      parentTask: task._id
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id // Will be set by auth middleware later
      },
      { status },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    handleError(res, error);
  }
};

// Add subtask
export const addSubtask = async (req, res) => {
  try {
    const parentTask = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id // Will be set by auth middleware later
    });

    if (!parentTask) {
      return res.status(404).json({ message: 'Parent task not found' });
    }

    const subtaskData = {
      ...req.body,
      parentTask: parentTask._id,
      createdBy: req.user._id
    };

    const subtask = new Task(subtaskData);
    await subtask.save();

    // Add subtask to parent's subtasks array
    parentTask.subtasks.push(subtask._id);
    await parentTask.save();

    res.status(201).json(subtask);
  } catch (error) {
    handleError(res, error);
  }
};

// Get tasks for daily log
export const getDailyTasks = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = {
      createdBy: req.user._id,
      $or: [
        // Tasks scheduled for today
        {
          dueDate: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        },
        // Unscheduled tasks (no due date) that are pending
        {
          dueDate: null,
          status: 'pending',
          isBacklog: false
        },
        // Past due tasks that should float to today
        {
          status: 'pending',
          isBacklog: false,
          dueDate: { $lt: today },
          $expr: {
            $and: [
              { $eq: [startOfDay, today] }
            ]
          }
        }
      ]
    };

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    handleError(res, error);
  }
};

// Get backlog tasks
export const getBacklogTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      createdBy: req.user._id,
      isBacklog: true,
      status: 'migrated_back'
    }).sort({ migratedFrom: -1 });

    res.json(tasks);
  } catch (error) {
    handleError(res, error);
  }
};

// Migrate task to backlog
export const migrateTaskToBacklog = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.migrateToBacklog();
    res.json(task);
  } catch (error) {
    handleError(res, error);
  }
};

// Migrate task to future date
export const migrateTaskToFuture = async (req, res) => {
  try {
    const { futureDate } = req.body;
    if (!futureDate) {
      return res.status(400).json({ message: 'Future date is required' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.migrateToFuture(new Date(futureDate));
    res.json(task);
  } catch (error) {
    handleError(res, error);
  }
};

// Get tasks for yearly log
export const getYearlyTasks = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {
      createdBy: req.user._id,
      $or: [
        {
          dueDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
        {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      ]
    };

    const tasks = await Task.find(query)
      .populate('parentTask', 'content status')
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    handleError(res, error);
  }
};

// Carry forward a task
export const carryForwardTask = async (req, res) => {
  try {
    const { newDueDate } = req.body;
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id
      },
      {
        dueDate: newDueDate,
        status: 'pending',
        migrated: true
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    handleError(res, error);
  }
};

// Get tasks for weekly log
export const getWeeklyTasks = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all tasks that fall within the week's date range
    const tasks = await Task.find({
      $or: [
        // Tasks with due dates within the week
        {
          dueDate: {
            $gte: startDate,
            $lte: endDate
          }
        },
        // Completed tasks within the week
        {
          status: 'completed',
          updatedAt: {
            $gte: startDate,
            $lte: endDate
          }
        },
        // Unscheduled tasks (they should show on today if today is in the week)
        {
          dueDate: null,
          status: 'pending',
          isBacklog: false
        },
        // Past due tasks (they should show on today if today is in the week)
        {
          dueDate: { $lt: today },
          status: 'pending'
        }
      ]
    }).sort({ dueDate: 1 });

    // Group tasks by date using the utility function
    const groupedTasks = getTasksForDates(tasks, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      today,
      includeCompleted: true,
      includeUnscheduled: true,
      includePastDue: true
    });

    res.json(groupedTasks);
  } catch (error) {
    console.error('Error fetching weekly tasks:', error);
    res.status(500).json({ error: 'Failed to fetch weekly tasks' });
  }
};

// Get tasks for monthly log
export const getMonthlyTasks = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all tasks that fall within the month's date range
    const tasks = await Task.find({
      createdBy: req.user._id,
      $or: [
        // Tasks with due dates within the month
        {
          dueDate: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
        // Completed tasks within the month
        {
          status: 'completed',
          updatedAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
        // Unscheduled tasks (they should show on today if today is in the month)
        {
          dueDate: null,
          status: 'pending',
          isBacklog: false
        },
        // Past due tasks (they should show on today if today is in the month)
        {
          dueDate: { $lt: today },
          status: 'pending'
        }
      ]
    }).sort({ dueDate: 1, createdAt: -1 });

    // Group tasks by date using the utility function
    const groupedTasks = getTasksForDates(tasks, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      today,
      includeCompleted: true,
      includeUnscheduled: true,
      includePastDue: true
    });

    res.json(groupedTasks);
  } catch (error) {
    console.error('Error fetching monthly tasks:', error);
    handleError(res, error);
  }
};

// Get all tasks in chronological order
export const getAllTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log('Getting all tasks for user:', req.user._id);

    // First, get all tasks without complex filtering
    const tasks = await Task.find({
      createdBy: req.user._id,
      isBacklog: false
    }).sort({ dueDate: -1, createdAt: -1 });

    console.log('Found tasks:', tasks.length);

    if (tasks.length === 0) {
      console.log('No tasks found for user');
      return res.json({});
    }

    // Group tasks by date
    const groupedTasks = {};
    tasks.forEach(task => {
      // Determine the date to use for grouping
      let dateToUse;
      if (task.status === 'completed') {
        dateToUse = task.updatedAt;
      } else if (task.dueDate) {
        dateToUse = task.dueDate;
      } else {
        dateToUse = task.createdAt;
      }

      // Format the date key
      const dateKey = format(new Date(dateToUse), 'yyyy-MM-dd');

      // Initialize the array if it doesn't exist
      if (!groupedTasks[dateKey]) {
        groupedTasks[dateKey] = [];
      }

      // Add the task to its date group
      groupedTasks[dateKey].push(task);
    });

    console.log('Grouped tasks by dates:', Object.keys(groupedTasks));

    // Sort tasks within each date
    Object.keys(groupedTasks).forEach(date => {
      groupedTasks[date].sort((a, b) => {
        // Sort by status first (pending before completed)
        if (a.status !== b.status) {
          return a.status === 'pending' ? -1 : 1;
        }
        // Then by priority
        if (a.priority !== b.priority) {
          return (a.priority || 999) - (b.priority || 999);
        }
        // Then by creation date
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    });

    res.json(groupedTasks);
  } catch (error) {
    console.error('Error in getAllTasks:', error);
    handleError(res, error);
  }
};