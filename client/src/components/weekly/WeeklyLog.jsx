import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Divider,
  Badge,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  isSameDay,
  getWeek
} from 'date-fns';
import { useTaskContext } from '../../context/TaskContext.jsx';
import TaskList from '../tasks/TaskList';

const WeeklyLog = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const { tasks, fetchWeeklyTasks } = useTaskContext();

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weekNumber = getWeek(selectedWeek, { weekStartsOn: 1 });

  useEffect(() => {
    fetchWeeklyTasks(weekStart, weekEnd);
  }, [selectedWeek, fetchWeeklyTasks]);

  const handlePreviousWeek = () => {
    setSelectedWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setSelectedWeek(prev => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setSelectedWeek(new Date());
  };

  const handleDateChange = (event) => {
    const newDate = new Date(event.target.value);
    setSelectedWeek(newDate);
  };

  const getTasksForDay = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);

    console.log(`\n=== Processing tasks for date: ${format(currentDate, 'yyyy-MM-dd')} ===`);
    console.log(`Current date being checked: ${format(currentDate, 'yyyy-MM-dd')}`);
    console.log(`Today's date: ${format(today, 'yyyy-MM-dd')}`);

    return tasks.filter(task => {
      const taskDueDate = task.dueDate ? new Date(task.dueDate) : null;
      if (taskDueDate) taskDueDate.setHours(0, 0, 0, 0);

      const taskUpdatedAt = new Date(task.updatedAt);
      taskUpdatedAt.setHours(0, 0, 0, 0);

      const taskDisplayDate = task.displayDate ? new Date(task.displayDate) : null;
      if (taskDisplayDate) taskDisplayDate.setHours(0, 0, 0, 0);

      const isTaskDueDate = taskDueDate && isSameDay(taskDueDate, currentDate);
      const isTaskCompletedDate = task.status === 'completed' && isSameDay(taskUpdatedAt, currentDate);
      const isToday = isSameDay(currentDate, today);
      const isPastDue = taskDueDate && taskDueDate < today && task.status === 'pending';
      const isDisplayDate = taskDisplayDate && isSameDay(taskDisplayDate, currentDate);

      console.log(`\nTask: ${task.content}`);
      console.log(`- Due Date: ${taskDueDate ? format(taskDueDate, 'yyyy-MM-dd') : 'None'}`);
      console.log(`- Display Date: ${taskDisplayDate ? format(taskDisplayDate, 'yyyy-MM-dd') : 'None'}`);
      console.log(`- Status: ${task.status}`);
      console.log(`- Updated At: ${format(taskUpdatedAt, 'yyyy-MM-dd')}`);
      console.log(`- Is Today: ${isToday}`);
      console.log(`- Is Past Due: ${isPastDue}`);
      console.log(`- Is Task Due Date: ${isTaskDueDate}`);
      console.log(`- Is Task Completed Date: ${isTaskCompletedDate}`);
      console.log(`- Is Display Date: ${isDisplayDate}`);
      console.log(`- Task Due Date < Today: ${taskDueDate ? taskDueDate < today : 'N/A'}`);
      console.log(`- Task Due Date > Today: ${taskDueDate ? taskDueDate > today : 'N/A'}`);

      let shouldShow = false;
      let reason = '';

      // For completed tasks, ONLY show on their completion date
      if (task.status === 'completed') {
        shouldShow = isTaskCompletedDate;
        reason = shouldShow ? 'Completed task showing on completion date' : 'Completed task not showing (wrong date)';
      }
      // For pending tasks with due dates
      else if (taskDueDate) {
        // If due date is in the future, only show on that date
        if (taskDueDate > today) {
          shouldShow = isTaskDueDate;
          reason = shouldShow ? 'Future task showing on due date' : 'Future task not showing (wrong date)';
        }
        // If due date is in the past, show on display date (today)
        else {
          shouldShow = isDisplayDate;
          reason = shouldShow ? 'Past due task showing on display date' : 'Past due task not showing (wrong date)';
        }
      }
      // For unscheduled tasks, show on display date (today)
      else if (!task.dueDate && task.status === 'pending' && !task.isBacklog) {
        shouldShow = isDisplayDate;
        reason = shouldShow ? 'Unscheduled task showing on display date' : 'Unscheduled task not showing (wrong date)';
      }

      console.log(`- Should Show: ${shouldShow} (${reason})`);
      return shouldShow;
    });
  };

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      p: 2
    }}>
      {/* Week Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
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
            Week {weekNumber} - {format(weekStart, 'MMMM d')} to {format(weekEnd, 'MMMM d, yyyy')}
          </Typography>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Today">
              <IconButton onClick={handleToday} size="small">
                <TodayIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Select date">
              <IconButton component="label" size="small">
                <CalendarIcon />
                <input
                  type="date"
                  value={format(selectedWeek, 'yyyy-MM-dd')}
                  onChange={handleDateChange}
                  style={{ display: 'none' }}
                />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleNextWeek} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Days Stack */}
      <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto' }}>
        {daysInWeek.map((day) => {
          const dayTasks = getTasksForDay(day);
          const hasHighPriorityTasks = dayTasks.some(task => task.priority === 1);
          const hasScheduledItems = dayTasks.some(task => task.signifier === '@');

          return (
            <Paper
              key={day.toISOString()}
              variant="outlined"
              sx={{
                p: 2,
                bgcolor: isToday(day) ? 'primary.50' : 'background.paper',
                borderColor: isToday(day) ? 'primary.main' : 'divider'
              }}
            >
              <Stack spacing={2}>
                {/* Day Header */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: isToday(day) ? 700 : 500,
                      color: isToday(day) ? 'primary.main' : 'text.primary',
                      minWidth: 200
                    }}
                  >
                    {format(day, 'EEEE')}
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{
                        ml: 2,
                        color: 'text.secondary'
                      }}
                    >
                      {format(day, 'MMMM d')}
                    </Typography>
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    {hasHighPriorityTasks && (
                      <Badge
                        color="error"
                        variant="dot"
                        sx={{ alignSelf: 'center' }}
                      >
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {dayTasks.filter(task => task.priority === 1).length} High Priority
                        </Typography>
                      </Badge>
                    )}
                    {hasScheduledItems && (
                      <Badge
                        color="primary"
                        variant="dot"
                        sx={{ alignSelf: 'center' }}
                      >
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {dayTasks.filter(task => task.signifier === '@').length} Scheduled
                        </Typography>
                      </Badge>
                    )}
                  </Stack>

                  {isToday(day) && (
                    <Typography
                      variant="caption"
                      sx={{
                        ml: 'auto',
                        color: 'primary.main',
                        fontWeight: 'bold'
                      }}
                    >
                      TODAY
                    </Typography>
                  )}
                </Stack>

                <Divider />

                {/* Tasks */}
                {dayTasks.length > 0 ? (
                  <TaskList
                    tasks={dayTasks}
                    showMigrationActions={true}
                    compact={false}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2 }}
                  >
                    No tasks scheduled
                  </Typography>
                )}
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default WeeklyLog;