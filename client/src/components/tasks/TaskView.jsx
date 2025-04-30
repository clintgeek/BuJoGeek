import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import useTaskStore from '../../store/taskStore';
import TaskList from './TaskList';
import MonthlyLog from '../monthly/MonthlyLog';

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

  if (viewType === 'monthly') {
    return (
      <Box>
        <MonthlyLog date={date} />
      </Box>
    );
  }

  return (
    <Box sx={{
      '& .css-1bg2tgm': {
        border: 'none !important'
      }
    }}>
      MARKER
      <TaskList tasks={tasks} viewType={viewType} />
    </Box>
  );
};

export default TaskView;