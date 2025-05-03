import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTaskContext } from '../../context/TaskContext';
import TaskList from './TaskList';
import MonthlyLog from '../monthly/MonthlyLog';
import YearlyLog from '../yearly/YearlyLog';

const TaskView = ({ viewType, date }) => {
  const { tasks, loading, error, fetchTasks, LoadingState } = useTaskContext();

  useEffect(() => {
    fetchTasks(viewType, date);
  }, [viewType, date, fetchTasks]);

  if (loading === LoadingState.FETCHING) {
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

  if (viewType === 'year') {
    return (
      <Box>
        <YearlyLog date={date} />
      </Box>
    );
  }

  return (
    <Box sx={{
      '& .css-1bg2tgm': {
        border: 'none !important'
      }
    }}>
      <TaskList tasks={tasks} viewType={viewType} />
    </Box>
  );
};

export default TaskView;