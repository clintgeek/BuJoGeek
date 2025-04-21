import Task from '../models/Task.js';
import { handleError } from '../utils/errorHandler.js';

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

    console.log('\n=== Weekly Tasks Query ===');
    console.log(`Start Date: ${startDate}`);
    console.log(`End Date: ${endDate}`);
    console.log(`Today: ${today.toISOString()}`);

    const query = {
      createdBy: req.user._id,
      $or: [
        // Tasks with future due dates within the week
        {
          dueDate: {
            $gte: today,
            $lte: new Date(endDate)
          },
          status: 'pending'
        },
        // Completed tasks that were completed within the week
        {
          status: 'completed',
          updatedAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        },
        // Floating tasks: incomplete tasks with no due date OR past due date
        // These only show up if today falls within the requested week
        {
          status: 'pending',
          isBacklog: false,
          $or: [
            { dueDate: null },
            { dueDate: { $lt: today } }
          ],
          $and: [
            {
              $expr: {
                $and: [
                  { $gte: [today, new Date(startDate)] },
                  { $lte: [today, new Date(endDate)] }
                ]
              }
            }
          ]
        }
      ]
    };

    console.log('\nQuery Conditions:');
    console.log(JSON.stringify(query, null, 2));

    const tasks = await Task.find(query)
      .populate('parentTask', 'content status')
      .sort({ dueDate: 1, createdAt: -1 });

    // Modify the tasks to set their display date to today if they are floating
    const modifiedTasks = tasks.map(task => {
      const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
      if (task.status === 'pending' && (taskDueDate === null || taskDueDate < today)) {
        // Create a new task object with the display date set to today
        return {
          ...task.toObject(),
          displayDate: today
        };
      }
      return task;
    });

    console.log('\nFound Tasks:');
    modifiedTasks.forEach(task => {
      const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
      const taskUpdatedAt = new Date(task.updatedAt);
      console.log(`\nTask: ${task.content}`);
      console.log(`- Due Date: ${taskDueDate ? taskDueDate.toISOString() : 'None'}`);
      console.log(`- Display Date: ${task.displayDate ? task.displayDate.toISOString() : 'None'}`);
      console.log(`- Status: ${task.status}`);
      console.log(`- Updated At: ${taskUpdatedAt.toISOString()}`);
      console.log(`- Is Backlog: ${task.isBacklog}`);
      console.log(`- Is Past Due: ${taskDueDate ? taskDueDate < today : 'N/A'}`);
      console.log(`- Is Future: ${taskDueDate ? taskDueDate > today : 'N/A'}`);
      console.log(`- Completion Date: ${task.status === 'completed' ? taskUpdatedAt.toISOString() : 'N/A'}`);
    });

    res.json(modifiedTasks);
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
        dueDate: -1,
        createdAt: -1
      });

    // Group tasks by date
    const groupedTasks = tasks.reduce((acc, task) => {
      let dateKey;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        // For pending tasks with past due dates, use today's date
        if (task.status === 'pending' && dueDate < today) {
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          dateKey = `${year}-${month}-${day}`;
        } else {
          // For scheduled tasks, use their due date
          const year = dueDate.getFullYear();
          const month = String(dueDate.getMonth() + 1).padStart(2, '0');
          const day = String(dueDate.getDate()).padStart(2, '0');
          dateKey = `${year}-${month}-${day}`;
        }
      } else if (task.status === 'completed') {
        // For completed items, use the completion date
        const completedDate = new Date(task.updatedAt);
        completedDate.setHours(0, 0, 0, 0);

        const year = completedDate.getFullYear();
        const month = String(completedDate.getMonth() + 1).padStart(2, '0');
        const day = String(completedDate.getDate()).padStart(2, '0');
        dateKey = `${year}-${month}-${day}`;
      } else {
        // For unscheduled, incomplete items, use today's date
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateKey = `${year}-${month}-${day}`;
      }

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    }, {});

    // Sort dates in reverse chronological order (newest/future dates first)
    const sortedEntries = Object.entries(groupedTasks)
      .sort(([dateA], [dateB]) => {
        return new Date(dateB) - new Date(dateA);
      });

    const sortedGroupedTasks = Object.fromEntries(sortedEntries);

    res.json(sortedGroupedTasks);
  } catch (error) {
    handleError(res, error);
  }
};