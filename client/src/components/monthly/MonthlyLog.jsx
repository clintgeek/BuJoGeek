import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Stack,
  Divider,
  Badge,
  Tooltip,
  Grid,
  useTheme,
  useMediaQuery,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  CalendarToday as CalendarIcon,
  MoreHoriz as MoreIcon,
  PriorityHigh as PriorityHighIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameMonth,
  getWeek,
  startOfWeek,
  endOfWeek,
  isWeekend,
} from 'date-fns';
import { useTaskContext, LoadingState } from '../../context/TaskContext';
import TaskCard from '../tasks/TaskCard';

{/* Task Creation Form - Temporarily Hidden
<Box sx={{ mb: 3 }}>
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider'
    }}
  >
    <Typography variant="h6" sx={{ mb: 2 }}>
      Create Task with Custom Dates
    </Typography>
    <Stack spacing={2}>
      <TextField
        fullWidth
        label="Task Content"
        required
      />
      <TextField
        fullWidth
        label="Created Date"
        type="datetime-local"
        defaultValue={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        label="Due Date"
        type="datetime-local"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        label="Completed Date"
        type="datetime-local"
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Button
        fullWidth
        variant="contained"
        color="primary"
      >
        Create Task
      </Button>
    </Stack>
  </Paper>
</Box>
*/}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DayCell = ({ day, tasks = [], isCurrentMonth, onClick }) => {
  const theme = useTheme();
  const highPriorityTasks = tasks.filter(task => task.priority === 1);
  const scheduledTasks = tasks.filter(task => task.signifier === '@');
  const maxPreviewTasks = 3;
  const hasMoreTasks = tasks.length > maxPreviewTasks;

  return (
    <Paper
      onClick={() => onClick(day, tasks)}
      sx={{
        height: '100%',
        p: 1,
        cursor: 'pointer',
        bgcolor: theme => {
          if (!isCurrentMonth) return theme.palette.grey[50];
          if (isWeekend(day)) return theme.palette.grey[100];
          if (isToday(day)) return theme.palette.primary[50];
          return theme.palette.background.paper;
        },
        border: theme => isToday(day) ? `2px solid ${theme.palette.primary.main}` : '1px solid',
        borderColor: 'divider',
        opacity: isCurrentMonth ? 1 : 0.5,
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 1,
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack spacing={1} sx={{ flex: 1 }}>
        {/* Date Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: isToday(day) ? 700 : 500,
              color: isToday(day) ? 'primary.main' : 'text.primary',
              fontSize: '1.1rem',
            }}
          >
            {format(day, 'd')}
          </Typography>
          {tasks.length > 0 && (
            <Stack direction="row" spacing={0.5}>
              {highPriorityTasks.length > 0 && (
                <Tooltip title={`${highPriorityTasks.length} high priority`}>
                  <Badge badgeContent={highPriorityTasks.length} color="error">
                    <PriorityHighIcon fontSize="small" color="error" />
                  </Badge>
                </Tooltip>
              )}
              {scheduledTasks.length > 0 && (
                <Tooltip title={`${scheduledTasks.length} scheduled`}>
                  <Badge badgeContent={scheduledTasks.length} color="primary">
                    <ScheduleIcon fontSize="small" color="primary" />
                  </Badge>
                </Tooltip>
              )}
            </Stack>
          )}
        </Stack>

        {/* Task Preview */}
        {tasks.length > 0 ? (
          <Stack spacing={0.5}>
            {tasks.slice(0, maxPreviewTasks).map(task => (
              <Typography
                key={task._id}
                variant="caption"
                noWrap
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: task.completed ? 'text.disabled' : 'text.primary',
                }}
              >
                • {task.title || task.content}
              </Typography>
            ))}
            {hasMoreTasks && (
              <Chip
                icon={<MoreIcon />}
                label={`${tasks.length - maxPreviewTasks} more`}
                size="small"
                variant="outlined"
                sx={{ alignSelf: 'flex-start' }}
              />
            )}
          </Stack>
        ) : (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: 'italic' }}
          >
            No tasks
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

const MonthlyLog = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayTasks, setSelectedDayTasks] = useState([]);
  const { tasks, loading, fetchMonthlyTasks } = useTaskContext();
  const lastFetchRef = useRef(null);

  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Memoize the date range to prevent unnecessary re-renders
  const dateRange = useMemo(() => ({
    start: monthStart,
    end: monthEnd
  }), [monthStart, monthEnd]);

  useEffect(() => {
    const fetchKey = `${dateRange.start.toISOString()}-${dateRange.end.toISOString()}`;

    // Only fetch if we're not already loading and haven't fetched this range
    if (loading === LoadingState.IDLE && lastFetchRef.current !== fetchKey) {
      console.log('Fetching monthly tasks for:', format(dateRange.start, 'yyyy-MM-dd'), 'to', format(dateRange.end, 'yyyy-MM-dd'));
      lastFetchRef.current = fetchKey;
      fetchMonthlyTasks(dateRange.start, dateRange.end);
    }
  }, [dateRange, fetchMonthlyTasks, loading]);

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setSelectedMonth(new Date());
  };

  const handleDateChange = (event) => {
    const newDate = new Date(event.target.value);
    setSelectedMonth(newDate);
  };

  const getTasksForDay = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayTasks = tasks[dateKey] || [];
    return dayTasks;
  };

  const handleDayClick = (day, dayTasks) => {
    setSelectedDay(day);
    setSelectedDayTasks(dayTasks);
  };

  const handleCloseDialog = () => {
    setSelectedDay(null);
    setSelectedDayTasks([]);
  };

  // Group days into weeks for the grid
  const weeks = [];
  let currentWeek = [];
  daysInCalendar.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      p: 2,
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Month Header */}
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
                  value={format(selectedMonth, 'yyyy-MM-dd')}
                  onChange={handleDateChange}
                  style={{ display: 'none' }}
                />
              </IconButton>
            </Tooltip>
            <IconButton onClick={handleNextMonth} size="small">
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Calendar Grid */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          p: 2,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Weekday Headers */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))',
            gap: 1,
            mb: 1,
            px: '1px',
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto',
          }}
        >
          {WEEKDAYS.map((day) => (
            <Box
              key={day}
              sx={{
                textAlign: 'center',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: day === 'Sun' || day === 'Sat' ? 'text.secondary' : 'text.primary',
                  fontSize: '0.875rem',
                  py: 1,
                  borderRadius: 1,
                  bgcolor: theme => theme.palette.grey[50],
                  width: '100%',
                  display: 'block',
                  textAlign: 'center',
                }}
              >
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar Days */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          margin: '0 auto',
        }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, minmax(120px, 1fr))',
              gap: 1,
              width: '100%',
              maxWidth: '100%',
              margin: '0 auto',
              mt: 1,
            }}
          >
            {weeks.map((week) => (
              week.map((day) => (
                <Box
                  key={day.toISOString()}
                  sx={{
                    aspectRatio: isMobile ? 'auto' : '1',
                    minHeight: isMobile ? 100 : 'auto',
                  }}
                >
                  <DayCell
                    day={day}
                    tasks={getTasksForDay(day)}
                    isCurrentMonth={isSameMonth(day, selectedMonth)}
                    onClick={handleDayClick}
                  />
                </Box>
              ))
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Day Detail Dialog */}
      <Dialog
        open={Boolean(selectedDay)}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedDay && format(selectedDay, 'EEEE, MMMM d, yyyy')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {selectedDayTasks.length > 0 ? (
              selectedDayTasks.map(task => (
                <TaskCard
                  key={task._id}
                  task={task}
                  showMigrationActions={true}
                />
              ))
            ) : (
              <Typography color="text.secondary">
                No tasks scheduled for this day
              </Typography>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MonthlyLog;