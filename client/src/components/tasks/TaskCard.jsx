import {
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  Flag as FlagIcon
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

const TaskCard = ({ task }) => {
  const { updateTaskStatus, deleteTask } = useTaskContext();
  const [isEditing, setIsEditing] = useState(false);

  const handleStatusToggle = async () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await updateTaskStatus(task._id, newStatus);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task._id);
    }
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
            <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }} onClick={() => setIsEditing(true)}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Box>
        }
      >
        <ListItemIcon onClick={handleStatusToggle} sx={{ cursor: 'pointer' }}>
          <Tooltip title={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}>
            {task.status === 'completed' ? (
              <CheckCircleIcon color="success" />
            ) : (
              <UncheckedIcon />
            )}
          </Tooltip>
        </ListItemIcon>

        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={task.taskType}>
                <Typography
                  component="span"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '1.2rem',
                    width: 24,
                    textAlign: 'center'
                  }}
                >
                  {signifierIcons[task.signifier]}
                </Typography>
              </Tooltip>
              <Typography
                component="span"
                sx={{
                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                  color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                  fontWeight: task.status === 'completed' ? 'normal' : 'bold'
                }}
              >
                {cleanContent(task.content)}
              </Typography>
              {task.priority && (
                <Tooltip title={`Priority ${task.priority}`}>
                  <FlagIcon color={priorityColors[task.priority]} fontSize="small" />
                </Tooltip>
              )}
            </Box>
          }
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
    </>
  );
};

export default TaskCard;