import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import useTaskStore from '../store/taskStore';
import TaskList from './TaskList';

const TaskView = ({ viewType, date }) => {
  const { tasks, loading, error, setView } = useTaskStore();

  useEffect(() => {
    setView(viewType, date);
  }, [viewType, date, setView]);

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
      <TaskList tasks={tasks} viewType={viewType} />
    </Box>
  );
};

export default TaskView;