import React, { useState } from 'react';
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
  TextField
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import useTaskStore from '../store/taskStore';
import { format } from 'date-fns';
import TaskEditor from './tasks/TaskEditor';

const TaskList = ({ tasks = [], viewType = 'daily' }) => {
  const { updateTaskStatus, deleteTask, migrateToBacklog, migrateToFuture, updateTask } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState(null);
  const [futureDate, setFutureDate] = useState(null);
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedTask, setEditedTask] = useState(null);

  // Ensure tasks is an array
  const taskArray = Array.isArray(tasks) ? tasks : [];

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

  const sortedTasks = sortTasks([...taskArray]);

  // Group tasks by date (for non-daily views)
  const groupTasksByDate = (tasks) => {
    return tasks.reduce((acc, task) => {
      const getLocalDate = (dateString) => {
        const date = new Date(dateString);
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      };
      const date = task.dueDate
        ? getLocalDate(task.dueDate).toISOString().split('T')[0]
        : getLocalDate(task.createdAt).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
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
      >
        <ListItem
          key={task._id}
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
            primary={task.content}
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
          Tasks
        </Typography>
        <List>
          {sortedTasks.map(renderTask)}
        </List>
        {taskArray.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" py={3}>
            No tasks found
          </Typography>
        )}
        {/* Future Date Selection Dialog */}
        <Dialog open={migrationDialogOpen} onClose={() => setMigrationDialogOpen(false)}>
          <DialogTitle>Migrate to Future Date</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Future Date"
                value={futureDate}
                onChange={(newValue) => setFutureDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mt: 2 }} />}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMigrationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFutureDateConfirm} variant="contained" color="primary">
              Migrate
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
    const tasksByDate = groupTasksByDate(taskArray);
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
        {taskArray.length === 0 && (
          <Typography variant="body1" color="text.secondary" align="center" py={3}>
            No tasks found
          </Typography>
        )}
        {/* Future Date Selection Dialog */}
        <Dialog open={migrationDialogOpen} onClose={() => setMigrationDialogOpen(false)}>
          <DialogTitle>Migrate to Future Date</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Future Date"
                value={futureDate}
                onChange={(newValue) => setFutureDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mt: 2 }} />}
              />
            </LocalizationProvider>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMigrationDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleFutureDateConfirm} variant="contained" color="primary">
              Migrate
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