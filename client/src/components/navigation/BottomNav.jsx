import React from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper
} from '@mui/material';
import {
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  CalendarViewWeek as CalendarViewWeekIcon,
  CalendarViewMonth as CalendarViewMonthIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const views = [
  { value: 'all', label: 'All', icon: ViewListIcon },
  { value: 'daily', label: 'Daily', icon: CalendarTodayIcon },
  { value: 'weekly', label: 'Weekly', icon: CalendarViewWeekIcon },
  { value: 'monthly', label: 'Monthly', icon: CalendarViewMonthIcon },
  { value: 'year', label: 'Year', icon: ViewModuleIcon }
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = location.pathname.split('/')[1] || 'daily';

  const handleChange = (event, newValue) => {
    navigate(`/${newValue}`);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}
      elevation={3}
    >
      <BottomNavigation
        value={currentView}
        onChange={handleChange}
        showLabels
      >
        {views.map((view) => (
          <BottomNavigationAction
            key={view.value}
            label={view.label}
            value={view.value}
            icon={<view.icon />}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;