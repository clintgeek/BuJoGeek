import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Divider,
  Grid,
  Badge
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay
} from 'date-fns';
import { useTaskContext } from '../../context/TaskContext';
import TaskList from '../tasks/TaskList';

const MonthlyLog = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { tasks, fetchMonthlyTasks } = useTaskContext();

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    fetchMonthlyTasks(monthStart, monthEnd);
  }, [selectedMonth, fetchMonthlyTasks]);

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  const getTasksForDay = (date) => {
    return tasks.filter(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && isSameDay(taskDate, date);
    });
  };

  const getDayStyle = (day) => {
    const dayTasks = getTasksForDay(day);
    const isCurrentMonth = isSameMonth(day, selectedMonth);
    const isCurrentDay = isToday(day);

    return {
      p: 1,
      height: '100%',
      minHeight: 100,
      bgcolor: isCurrentDay ? 'primary.50' : isCurrentMonth ? 'background.paper' : 'action.hover',
      borderRadius: 1,
      border: '1px solid',
      borderColor: isCurrentDay ? 'primary.main' : 'divider',
      opacity: isCurrentMonth ? 1 : 0.5
    };
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
          <IconButton onClick={handlePreviousMonth} size="small">
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
            {format(selectedMonth, 'MMMM yyyy')}
          </Typography>

          <IconButton onClick={handleNextMonth} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {/* Weekday headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <Grid item xs key={day}>
              <Typography
                variant="subtitle2"
                align="center"
                sx={{
                  mb: 1,
                  color: 'text.secondary',
                  fontWeight: 500
                }}
              >
                {day}
              </Typography>
            </Grid>
          ))}

          {/* Calendar days */}
          {daysInMonth.map((day) => {
            const dayTasks = getTasksForDay(day);
            const hasHighPriorityTasks = dayTasks.some(task => task.priority === 1);
            const hasScheduledItems = dayTasks.some(task => task.signifier === '@');

            return (
              <Grid item xs key={day.toISOString()}>
                <Paper
                  variant="outlined"
                  sx={getDayStyle(day)}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      textAlign: 'right',
                      mb: 1,
                      fontWeight: isToday(day) ? 700 : 400,
                      color: isToday(day) ? 'primary.main' : 'text.secondary'
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>

                  {(hasHighPriorityTasks || hasScheduledItems) && (
                    <Stack spacing={0.5}>
                      {hasHighPriorityTasks && (
                        <Badge
                          color="error"
                          variant="dot"
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            High Priority
                          </Typography>
                        </Badge>
                      )}
                      {hasScheduledItems && (
                        <Badge
                          color="primary"
                          variant="dot"
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            Scheduled
                          </Typography>
                        </Badge>
                      )}
                    </Stack>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
};

export default MonthlyLog;