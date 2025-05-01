import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek
} from 'date-fns';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TaskFilters from './tasks/TaskFilters';
import { useLocation } from 'react-router-dom';

const DateNavigation = ({ currentDate, onDateChange }) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const location = useLocation();
  const isDailyView = !location.pathname.split('/')[2] || location.pathname.split('/')[2] === 'daily';
  const isWeeklyView = !location.pathname.split('/')[2] || location.pathname.split('/')[2] === 'weekly';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePrevious = () => {
    let newDate;
    switch (window.location.pathname.split('/')[2]) {
      case 'weekly':
        newDate = subWeeks(currentDate, 1);
        break;
      case 'monthly':
        newDate = subMonths(currentDate, 1);
        break;
      default:
        newDate = subDays(currentDate, 1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate;
    switch (window.location.pathname.split('/')[2]) {
      case 'weekly':
        newDate = addWeeks(currentDate, 1);
        break;
      case 'monthly':
        newDate = addMonths(currentDate, 1);
        break;
      default:
        newDate = addDays(currentDate, 1);
    }
    onDateChange(newDate);
  };

  const formatDate = () => {
    switch (window.location.pathname.split('/')[2]) {
      case 'weekly':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 = Sunday
        return `Week of ${format(weekStart, 'MMMM d, yyyy')}`;
      case 'monthly':
        return format(currentDate, 'MMMM yyyy');
      default:
        return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isDailyView && !isMobile ? 'row' : 'column',
          gap: 2,
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{
            minWidth: isDailyView ? 'auto' : 'none',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handlePrevious}>
              <ChevronLeftIcon />
            </IconButton>

            <Typography variant="h6" component="div" noWrap>
              {formatDate()}
            </Typography>

            <IconButton onClick={() => setIsCalendarOpen(true)}>
              <CalendarIcon />
            </IconButton>

            <IconButton onClick={handleNext}>
              <ChevronRightIcon />
            </IconButton>
          </Box>

          {(isDailyView || isWeeklyView) && !isMobile && <TaskFilters />}
        </Stack>

        {(isDailyView || isWeeklyView) && isMobile && <TaskFilters />}
      </Box>

      <Dialog
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Select Date</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              value={currentDate}
              onChange={(newDate) => {
                onDateChange(newDate);
                setIsCalendarOpen(false);
              }}
              slotProps={{
                actionBar: {
                  actions: []
                }
              }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCalendarOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DateNavigation;