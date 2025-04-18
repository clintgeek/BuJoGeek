import { useState, useEffect } from 'react';
import {
  Box,
  List,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import TaskCard from './TaskCard';
import { useTaskContext } from '../../context/TaskContext';

const TaskList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tasks, fetchTasks } = useTaskContext();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchTasks();
      } catch (err) {
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [fetchTasks]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!tasks.length) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography color="textSecondary">
          No tasks found. Create a new task to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%' }}>
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
        />
      ))}
    </List>
  );
};

export default TaskList;