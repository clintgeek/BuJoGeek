import React, { useEffect } from 'react';
import { List, Box, Typography, Paper } from '@mui/material';
import TaskCard from './TaskCard';
import { useTaskContext } from '../../context/TaskContext';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';

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

  if (view === 'all') {
    return (
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        p: 0.5,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box sx={{
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
          }}>
            {Object.entries(tasks).map(([group, groupTasks]) => (
              <Box key={group}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    px: 2,
                    py: 1,
                    textTransform: 'capitalize',
                    fontFamily: '"Roboto Mono", monospace',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                  }}
                >
                  {group} Tasks
                </Typography>
                <List disablePadding>
                  {Array.isArray(groupTasks) && groupTasks.length > 0 ? (
                    groupTasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onEdit={onEdit}
                      />
                    ))
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        px: 2,
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      No {group} tasks
                    </Typography>
                  )}
                </List>
              </Box>
            ))}
          </Box>
        </Paper>
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