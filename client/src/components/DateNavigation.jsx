import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';
import { format, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns';

const DateNavigation = ({ currentDate, onDateChange }) => {
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
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}
    >
      <IconButton onClick={handlePrevious}>
        <ChevronLeftIcon />
      </IconButton>

      <Typography variant="h6" component="div">
        {formatDate()}
      </Typography>

      <IconButton onClick={handleNext}>
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );
};

export default DateNavigation;