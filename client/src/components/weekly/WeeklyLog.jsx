import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Divider,
  Grid
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay
} from 'date-fns';
import { useTaskContext } from '../../context/TaskContext.jsx';
import TaskList from '../tasks/TaskList';

const WeeklyLog = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const { tasks, fetchWeeklyTasks } = useTaskContext();

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    fetchWeeklyTasks(weekStart, weekEnd);
  }, [selectedWeek, fetchWeeklyTasks]);

  const handlePreviousWeek = () => {
    setSelectedWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek(prev => addWeeks(prev, 1));
  };

  const getTasksForDay = (date) => {
    return tasks.filter(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && isSameDay(taskDate, date);
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <IconButton onClick={handlePreviousWeek} size="small">
            <ChevronLeftIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{
              flex: 1,
              textAlign: 'center',
              fontFamily: '"Roboto Mono", monospace',
              fontWeight: 500
            }}
          >
            Week of {format(weekStart, 'MMMM d, yyyy')}
          </Typography>

          <IconButton onClick={handleNextWeek} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {daysInWeek.map((day) => (
            <Grid item xs={12} key={day.toISOString()}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: isToday(day) ? 'primary.50' : 'background.paper'
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    fontWeight: isToday(day) ? 700 : 500,
                    color: isToday(day) ? 'primary.main' : 'text.primary'
                  }}
                >
                  {format(day, 'EEEE, MMMM d')}
                  {isToday(day) && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        ml: 1,
                        color: 'primary.main',
                        fontWeight: 'bold'
                      }}
                    >
                      TODAY
                    </Typography>
                  )}
                </Typography>

                <TaskList
                  tasks={getTasksForDay(day)}
                  showMigrationActions={false}
                  compact={true}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default WeeklyLog;