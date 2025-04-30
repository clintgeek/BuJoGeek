import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import TaskView from '../components/tasks/TaskView';
import DateNavigation from '../components/DateNavigation';
import TaskFilters from '../components/tasks/TaskFilters';

const TasksPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const location = useLocation();
  const view = location.pathname.split('/')[2] || 'daily';

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  return (
    <Box sx={{
      height: 'calc(100vh - 175px)', // Account for header and navigation
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Filters for ALL view */}
      {view === 'all' && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <TaskFilters />
        </Box>
      )}

      {/* Date Navigation for other views */}
      {view !== 'all' && (
        <DateNavigation
          currentDate={currentDate}
          onDateChange={handleDateChange}
        />
      )}

      {/* Main Task View */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <TaskView viewType={view} date={currentDate} />
      </Box>
    </Box>
  );
};

export default TasksPage;