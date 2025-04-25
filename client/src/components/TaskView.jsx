import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import useTaskStore from '../store/taskStore';
import TaskList from './TaskList';

const TaskView = ({ viewType, date }) => {
  const { tasks, loading, error, setView } = useTaskStore();

  useEffect(() => {
    console.log('TaskView mounted/updated with viewType:', viewType, 'date:', date);
    setView(viewType, date);
  }, [viewType, date, setView]);

  console.log('TaskView rendering with tasks:', tasks, 'loading:', loading, 'error:', error);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TaskList tasks={tasks} />
    </Box>
  );
};

export default TaskView;