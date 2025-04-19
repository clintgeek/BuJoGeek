import React, { useEffect } from 'react';
import { List, Box, Typography } from '@mui/material';
import TaskCard from './TaskCard';
import { useTaskContext } from '../../context/TaskContext';

const TaskList = ({ onEdit, currentDate }) => {
  const { tasks, loading, error, fetchTasks } = useTaskContext();

  useEffect(() => {
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    fetchTasks(startOfDay, endOfDay);
  }, [currentDate, fetchTasks]);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading tasks...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">Error loading tasks: {error}</Typography>
      </Box>
    );
  }

  return (
    <List sx={{ flex: 1, overflow: 'auto' }}>
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onEdit={onEdit}
        />
      ))}
    </List>
  );
};

export default TaskList;