import React, { useState, useMemo } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Stack
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useTaskStore from '../../store/taskStore';
import { format } from 'date-fns';
import TaskEditor from '../tasks/TaskEditor';

const TaskList = ({ tasks = [], viewType = 'daily' }) => {
  const { updateTaskStatus, deleteTask, migrateToBacklog, migrateToFuture, updateTask, filters } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState(null);
  const [futureDate, setFutureDate] = useState(null);
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState(null);

  // Ensure tasks is an array
  const taskArray = Array.isArray(tasks) ? tasks : [];

  // Filter tasks based on the filters from TaskStore
  const filteredTasks = taskArray.filter(task => {
    const matchesSearch = !filters.search ||
      task.content.toLowerCase().includes(filters.search.toLowerCase()) ||
      (task.tags && task.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase())));

    const matchesStatus = !filters.status || task.status === filters.status;
    const matchesPriority = !filters.priority || task.priority === Number(filters.priority);
    const matchesType = !filters.type || task.signifier === filters.type;
    const matchesTags = !filters.tags?.length ||
      (task.tags && filters.tags.every(tag => task.tags.includes(tag)));

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesTags;
  });

  // Get unique tags and types from tasks
  const { uniqueTags, uniqueTypes } = useMemo(() => {
    const tags = new Set();
    const types = new Set();
    taskArray.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => tags.add(tag));
      }
      if (task.signifier) {
        types.add(task.signifier);
      }
    });
    return {
      uniqueTags: Array.from(tags).sort(),
      uniqueTypes: Array.from(types).sort()
    };
  }, [taskArray]);

  // Sort tasks: pending first (scheduled, then unscheduled), completed at the bottom; within each, sort by priority (high to low), then by creation date (newest first)
  const sortTasks = (tasks) => {
    return tasks.sort((a, b) => {
      // Completed tasks always at the bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;

      // Scheduled tasks (with dueDate) at top
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;

      // Within each group, sort by priority (high to low)
      if ((b.priority || 0) !== (a.priority || 0)) {
        return (b.priority || 0) - (a.priority || 0);
      }

      // Then by creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const sortedTasks = sortTasks([...filteredTasks]);

  // Group tasks by date (for non-daily views)
  const groupTasksByDate = (tasks) => {
    return tasks.reduce((acc, task) => {
      const getLocalDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        // Convert to local timezone date string
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString().split('T')[0];
      };

      // For completed tasks, use the completion date (updatedAt)
      // For scheduled tasks, use the due date
      // For other tasks, use the creation date
      let dateToUse;
      if (task.status === 'completed') {
        dateToUse = getLocalDate(task.updatedAt);
      } else if (task.dueDate) {
        dateToUse = getLocalDate(task.dueDate);
      } else {
        dateToUse = getLocalDate(task.createdAt);
      }

      if (!acc[dateToUse]) acc[dateToUse] = [];
      acc[dateToUse].push(task);
      return acc;
    }, {});
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleMigrateToBacklog = async (taskId) => {
    try {
      await migrateToBacklog(taskId);
    } catch (error) {
      console.error('Error migrating task to backlog:', error);
    }
  };

  const handleMigrateToFuture = (taskId) => {
    setSelectedTask(taskId);
    setMigrationDialogOpen(true);
  };

  const handleFutureDateConfirm = async () => {
    if (selectedTask && futureDate) {
      try {
        await migrateToFuture(selectedTask, futureDate);
        setMigrationDialogOpen(false);
        setSelectedTask(null);
        setFutureDate(null);
      } catch (error) {
        console.error('Error migrating task to future:', error);
      }
    }
  };

  const handleTaskClick = (task) => {
    setEditedTask(task);
    setEditDialogOpen(true);
  };

  const renderTask = (task) => {
    // Helper to format due date/time
    const formatDueDate = (dueDate) => {
      if (!dueDate) return null;
      const dateObj = new Date(dueDate);
      // Show time if not midnight, otherwise just date
      if (dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0) {
        return `Scheduled: ${format(dateObj, 'EEEE, MMMM d, yyyy, h:mm a')}`;
      }
      return `Scheduled: ${format(dateObj, 'EEEE, MMMM d, yyyy')}`;
    };

    // Priority color
    const priorityColor =
      task.priority === 1 ? 'error.main' :
      task.priority === 2 ? 'warning.main' :
      task.priority === 3 ? 'info.main' : 'grey.300';

    // Completed color
    const completedColor = 'success.main';

    // Double border for completed + priority
    const isCompleted = task.status === 'completed';
    const hasPriority = !!task.priority;

    // Determine if task is carried over (pending, unscheduled, created before today)
    let isCarriedOver = false;
    let isOverdue = false;
    if (!task.dueDate && task.status === 'pending') {
      const created = new Date(task.createdAt);
      const now = new Date();
      // Set both to local midnight for comparison
      created.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      if (created < now) {
        isCarriedOver = true;
        // Check if carried over more than 7 days
        const msInDay = 24 * 60 * 60 * 1000;
        const daysCarried = Math.floor((now - created) / msInDay);
        if (daysCarried > 7) {
          isOverdue = true;
        }
      }
    }

    return (
      <Box
        sx={isCompleted && hasPriority ? {
          borderLeft: '6px solid',
          borderColor: completedColor,
          pl: 0,
          ml: 0,
          // To visually separate the double border
          position: 'relative',
        } : {}}
        key={task._id}
      >
        <ListItem
          onClick={() => handleTaskClick(task)}
          sx={{
            borderLeft: '4px solid',
            borderColor: priorityColor,
            mb: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          {/* Right edge bar for completion/carry-over status */}
          {isCompleted && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: '6px',
                borderRadius: '0 4px 4px 0',
                bgcolor: 'success.main',
                zIndex: 2
              }}
            />
          )}
          {isCarriedOver && !isCompleted && !isOverdue && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: '6px',
                borderRadius: '0 4px 4px 0',
                bgcolor: 'warning.main',
                zIndex: 2
              }}
            />
          )}
          {isCarriedOver && !isCompleted && isOverdue && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: '6px',
                borderRadius: '0 4px 4px 0',
                bgcolor: 'error.main',
                zIndex: 2
              }}
            />
          )}
          <ListItemText
            primary={
              <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: 'monospace',
                    mr: 1,
                    color: 'text.secondary',
                    fontSize: '1.1rem'
                  }}
                >
                  {task.signifier || '*'}
                </Typography>
                {task.content}
              </Box>
            }
            secondary={
              <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                {task.dueDate && (
                  <Typography variant="caption" color="text.secondary">
                    {formatDueDate(task.dueDate)}
                  </Typography>
                )}
                {task.tags && task.tags.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    Tags: {task.tags.join(', ')}
                  </Typography>
                )}
              </Box>
            }
          />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={(e) => {
                e.stopPropagation();
                handleMigrateToBacklog(task._id);
              }}
              sx={{ mr: 1 }}
              title="Migrate to Backlog"
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              edge="end"
              onClick={(e) => {
                e.stopPropagation();
                handleMigrateToFuture(task._id);
              }}
              sx={{ mr: 1 }}
              title="Migrate to Future"
            >
              <ArrowForwardIcon />
            </IconButton>
            <IconButton
              edge="end"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(task._id, task.status === 'completed' ? 'pending' : 'completed');
              }}
              sx={{ mr: 1 }}
              title={task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
            >
              <CheckIcon color={task.status === 'completed' ? 'success' : 'action'} />
            </IconButton>
            <IconButton
              edge="end"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(task._id);
              }}
              title="Delete Task"
            >
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </Box>
    );
  };

  if (viewType === 'daily') {
    return (
      <Box>
        <List>
          {sortedTasks.map(renderTask)}
        </List>
        {taskArray.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" py={3}>
            No tasks found
          </Typography>
        )}
        {/* Future Date Dialog */}
        <Dialog open={migrationDialogOpen} onClose={() => setMigrationDialogOpen(false)}>
          <DialogTitle>Select Future Date</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Future Date and Time"
                value={futureDate}
                onChange={(newDate) => setFutureDate(newDate)}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal'
                  }
                }}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMigrationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFutureDateConfirm} color="primary" disabled={!futureDate}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        {/* Edit Task Dialog */}
        <TaskEditor
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setEditedTask(null);
          }}
          task={editedTask}
        />
      </Box>
    );
  } else {
    // Group and sort tasks by date
    const tasksByDate = groupTasksByDate(filteredTasks);
    const sortedDates = Object.keys(tasksByDate).sort((a, b) => new Date(b) - new Date(a));
    Object.keys(tasksByDate).forEach(date => {
      tasksByDate[date] = sortTasks(tasksByDate[date]);
    });
    return (
      <Box>
        {sortedDates.map((date) => (
          <Box key={date} mb={3}>
            <Typography
              variant="subtitle1"
              sx={{
                px: 2,
                py: 1,
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                position: 'sticky',
                top: 0,
                zIndex: 1
              }}
            >
              {format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
            </Typography>
            <List>
              {tasksByDate[date].map(renderTask)}
            </List>
          </Box>
        ))}
        {filteredTasks.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" py={3}>
            No tasks found
          </Typography>
        )}
        {/* Future Date Dialog */}
        <Dialog open={migrationDialogOpen} onClose={() => setMigrationDialogOpen(false)}>
          <DialogTitle>Select Future Date</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Future Date and Time"
                value={futureDate}
                onChange={(newDate) => setFutureDate(newDate)}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal'
                  }
                }}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMigrationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFutureDateConfirm} color="primary" disabled={!futureDate}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        {/* Edit Task Dialog */}
        <TaskEditor
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setEditedTask(null);
          }}
          task={editedTask}
        />
      </Box>
    );
  }
};

export default TaskList;