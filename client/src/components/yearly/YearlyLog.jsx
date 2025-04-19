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
  addYears,
  subYears,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  isSameMonth,
  isThisMonth
} from 'date-fns';
import { useTaskContext } from '../../context/TaskContext.jsx';

const YearlyLog = () => {
  const [selectedYear, setSelectedYear] = useState(new Date());
  const { tasks, fetchYearlyTasks } = useTaskContext();

  const yearStart = startOfYear(selectedYear);
  const yearEnd = endOfYear(selectedYear);
  const monthsInYear = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  useEffect(() => {
    fetchYearlyTasks(yearStart, yearEnd);
  }, [selectedYear, fetchYearlyTasks]);

  const handlePreviousYear = () => {
    setSelectedYear(prev => subYears(prev, 1));
  };

  const handleNextYear = () => {
    setSelectedYear(prev => addYears(prev, 1));
  };

  const getTasksForMonth = (date) => {
    return tasks.filter(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && isSameMonth(taskDate, date);
    });
  };

  const getMonthStyle = (month) => {
    return {
      p: 2,
      height: '100%',
      minHeight: 120,
      bgcolor: isThisMonth(month) ? 'primary.50' : 'background.paper',
      borderRadius: 2,
      border: '1px solid',
      borderColor: isThisMonth(month) ? 'primary.main' : 'divider'
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
          <IconButton onClick={handlePreviousYear} size="small">
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
            {format(selectedYear, 'yyyy')}
          </Typography>

          <IconButton onClick={handleNextYear} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          {monthsInYear.map((month) => {
            const monthTasks = getTasksForMonth(month);
            const hasHighPriorityTasks = monthTasks.some(task => task.priority === 1);
            const hasScheduledItems = monthTasks.some(task => task.signifier === '@');

            return (
              <Grid item xs={12} sm={6} md={4} key={month.toISOString()}>
                <Paper
                  variant="outlined"
                  sx={getMonthStyle(month)}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      mb: 2,
                      fontWeight: isThisMonth(month) ? 700 : 500,
                      color: isThisMonth(month) ? 'primary.main' : 'text.primary'
                    }}
                  >
                    {format(month, 'MMMM')}
                  </Typography>

                  <Stack spacing={1}>
                    {hasHighPriorityTasks && (
                      <Badge
                        color="error"
                        variant="dot"
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {monthTasks.filter(task => task.priority === 1).length} High Priority
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
                          {monthTasks.filter(task => task.signifier === '@').length} Scheduled
                        </Typography>
                      </Badge>
                    )}
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>
    </Box>
  );
};

export default YearlyLog;