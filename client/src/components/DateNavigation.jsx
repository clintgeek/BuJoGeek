import React, { forwardRef } from 'react';
import { Box, IconButton, Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TaskFilters from './TaskFilters';
import { useLocation } from 'react-router-dom';

const CustomPickerButton = forwardRef(({ inputProps, InputProps, onClick }, ref) => (
  <IconButton ref={ref} onClick={onClick || InputProps?.onClick}>
    <CalendarIcon />
  </IconButton>
));

CustomPickerButton.displayName = 'CustomPickerButton';

const DateNavigation = ({ currentDate, onDateChange }) => {
  const location = useLocation();
  const isDailyView = !location.pathname.split('/')[2] || location.pathname.split('/')[2] === 'daily';
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
        return `Week of ${format(currentDate, 'MMMM d, yyyy')}`;
      case 'monthly':
        return format(currentDate, 'MMMM yyyy');
      default:
        return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  return (
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

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={currentDate}
              onChange={onDateChange}
              enableAccessibleFieldDOMStructure={false}
              slots={{
                textField: CustomPickerButton
              }}
              slotProps={{
                popper: {
                  sx: { zIndex: 1300 }
                }
              }}
            />
          </LocalizationProvider>

          <IconButton onClick={handleNext}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {isDailyView && !isMobile && <TaskFilters />}
      </Stack>

      {isDailyView && isMobile && <TaskFilters />}
    </Box>
  );
};

export default DateNavigation;