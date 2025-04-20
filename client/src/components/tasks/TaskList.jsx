import React, { useEffect } from 'react';
import { List, Box, Typography } from '@mui/material';
import TaskCard from './TaskCard';
import { useTaskContext } from '../../context/TaskContext';
import { useLocation } from 'react-router-dom';
import { format, isValid } from 'date-fns';

const TaskList = ({ onEdit, currentDate }) => {
  const { tasks, loading, error, fetchTasks } = useTaskContext();
  const location = useLocation();
  const view = location.pathname.split('/')[2] || 'daily';

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

  // Handle case when tasks data hasn't been loaded yet or is in wrong format
  if (!tasks) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading tasks...</Typography>
      </Box>
    );
  }

  if (view === 'all') {
    // Make sure tasks is an object before trying to access keys
    if (typeof tasks !== 'object' || Array.isArray(tasks) || tasks === null) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography>Loading tasks...</Typography>
        </Box>
      );
    }

    // Sort dates in reverse chronological order (future dates first)
    const sortedDates = Object.keys(tasks).sort((a, b) => {
      // Handle the special case where 'Unscheduled' might still exist in the data
      if (a === 'Unscheduled') return 1;
      if (b === 'Unscheduled') return -1;

      // Parse dates properly to avoid timezone issues
      const parseLocalDate = (dateKey) => {
        const [year, month, day] = dateKey.split('-').map(Number);
        return new Date(year, month - 1, day);
      };

      // Sort in reverse chronological order (newest/future dates first)
      return parseLocalDate(b) - parseLocalDate(a);
    });

    return (
      <List
        disablePadding
        sx={{
          flex: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
            bgcolor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
            bgcolor: 'rgba(0, 0, 0, 0.1)'
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent'
          }
        }}
      >
        {sortedDates.map((dateKey) => (
          tasks[dateKey]?.length > 0 && (
            <Box key={dateKey}>
              <Typography
                variant="subtitle2"
                sx={{
                  px: 2,
                  py: 1,
                  fontFamily: '"Roboto Mono", monospace',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                  position: 'sticky',
                  top: 0,
                  bgcolor: 'background.paper',
                  zIndex: 1
                }}
              >
                {dateKey === 'Unscheduled'
                  ? 'Unscheduled'
                  : (() => {
                      // Create a date object that preserves the date parts exactly as-is
                      const [year, month, day] = dateKey.split('-').map(Number);

                      // Create a date using local date constructor
                      // This ensures we get the exact date without timezone issues
                      const date = new Date(year, month - 1, day);

                      if (!isValid(date)) return dateKey;
                      return format(date, 'EEEE, MMMM d, yyyy');
                    })()
                }
              </Typography>
              {tasks[dateKey].map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={onEdit}
                />
              ))}
            </Box>
          )
        ))}
      </List>
    );
  }

  // Daily view (and other views)
  // Check if tasks is actually an array before mapping
  if (!Array.isArray(tasks)) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading tasks...</Typography>
      </Box>
    );
  }

  return (
    <List
      disablePadding
      sx={{
        flex: 1,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '8px',
          bgcolor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: '4px',
          bgcolor: 'rgba(0, 0, 0, 0.1)'
        },
        '&::-webkit-scrollbar-track': {
          bgcolor: 'transparent'
        }
      }}
    >
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