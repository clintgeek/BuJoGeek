import Task from '../models/Task.js';
import { handleError } from '../utils/errorHandler.js';

// Create a new task
export const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id // Will be set by auth middleware later
    };

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
      .sort({ dueDate: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    handleError(res, error);
  }
};

// Get tasks for monthly log
export const getMonthlyTasks = async (req, res) => {
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
      .sort({ dueDate: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    handleError(res, error);
  }
};

// Get all tasks in chronological order
export const getAllTasks = async (req, res) => {
  try {
    const query = {
      createdBy: req.user._id,
      isBacklog: false
    };

    const tasks = await Task.find(query)
      .sort({
        // First sort by due date (null values last)
        dueDate: 1,
        // Then sort by creation date (newest first)
        createdAt: -1
      });

    // Group tasks into future, current, and past
    const now = new Date();
    const groupedTasks = {
      future: [],
      current: [],
      past: []
    };

    tasks.forEach(task => {
      if (!task.dueDate) {
        // Unscheduled tasks go in current
        groupedTasks.current.push(task);
      } else if (task.dueDate > now) {
        groupedTasks.future.push(task);
      } else if (task.dueDate < now) {
        groupedTasks.past.push(task);
      } else {
        groupedTasks.current.push(task);
      }
    });

    res.json(groupedTasks);
  } catch (error) {
    handleError(res, error);
  }
};