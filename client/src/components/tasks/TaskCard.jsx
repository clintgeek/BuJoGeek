import {
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon,
  KeyboardReturn as BacklogIcon,
  KeyboardTab as ForwardIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTaskContext } from '../../context/TaskContext';
import { useState } from 'react';
import TaskEditor from './TaskEditor';

const signifierIcons = {
  '*': '*',
  '@': '@',
  'x': 'x',
  '<': '<',
  '>': '>',
  '-': '-',
  '!': '!',
  '?': '?',
  '#': '#'
};

const priorityColors = {
  1: 'error',
  2: 'warning',
  3: 'info'
};

const TaskCard = ({ task, onEdit }) => {
  const { updateTaskStatus, deleteTask, updateTask } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(null);

  const handleStatusToggle = async () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTaskStatus(task._id, newStatus);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task._id);
    }
  };

  const handleMoveToBacklog = async () => {
    if (window.confirm('Move this task to the backlog?')) {
      await updateTask(task._id, { ...task, status: 'migrated_back', dueDate: null });
    }
  };

  const handleScheduleForward = () => {
    setScheduledDate(task.dueDate ? new Date(task.dueDate) : new Date());
    setIsScheduling(true);
  };

  const handleScheduleSubmit = async () => {
    await updateTask(task._id, {
      ...task,
      status: 'migrated_future',
      dueDate: scheduledDate
    });
    setIsScheduling(false);
  };

  // Clean the content by removing tags and priority markers
  const cleanContent = (content) => {
    return content
      .replace(/#\w+/g, '') // Remove tags
      .replace(/!(high|medium|low)/i, '') // Remove priority
      .trim();
  };

  return (
    <>
      <ListItem
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'action.hover'
          }
        }}
        secondaryAction={
          <Box>
            <Tooltip title="Move to backlog">
              <IconButton edge="end" aria-label="backlog" onClick={handleMoveToBacklog} sx={{ mr: 1 }}>
                <BacklogIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Schedule forward">
              <IconButton edge="end" aria-label="schedule" onClick={handleScheduleForward} sx={{ mr: 1 }}>
                <ForwardIcon />
              </IconButton>
            </Tooltip>
            <IconButton edge="end" aria-label="edit" onClick={() => setIsEditing(true)} sx={{ mr: 1 }}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Box>
        }
      >
        <ListItemIcon>
          <IconButton onClick={handleStatusToggle}>
            {task.status === 'completed' ? (
              <CheckCircleIcon color="success" />
            ) : (
              <UncheckedIcon />
            )}
          </IconButton>
        </ListItemIcon>
        <ListItemText
          primary={cleanContent(task.content)}
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {task.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{ height: 20 }}
                  />
                ))}
                {task.subtasks?.length > 0 && (
                  <Chip
                    label={`${task.subtasks.length} subtask${task.subtasks.length === 1 ? '' : 's'}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 20 }}
                  />
                )}
              </Box>
              {task.dueDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                  <ScheduleIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2" component="span">
                    {format(new Date(task.dueDate), 'EEE, MMM d, yyyy h:mm a')}
                    {task.signifier === '@' && ' (event)'}
                  </Typography>
                </Box>
              )}
            </Box>
          }
        />
      </ListItem>

      <TaskEditor
        open={isEditing}
        onClose={() => setIsEditing(false)}
        task={task}
      />

      <Dialog open={isScheduling} onClose={() => setIsScheduling(false)}>
        <DialogTitle>Schedule Task</DialogTitle>
        <DialogContent>
          <DateTimePicker
            label="Due Date & Time"
            value={scheduledDate}
            onChange={setScheduledDate}
            slotProps={{ textField: { fullWidth: true, sx: { mt: 2 } } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsScheduling(false)}>Cancel</Button>
          <Button onClick={handleScheduleSubmit} variant="contained">
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TaskCard;