import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, useTheme, useMediaQuery } from '@mui/material';
import useTaskStore from '../store/taskStore';
import { useLocation } from 'react-router-dom';

const TaskFilters = () => {
  const { filters, setFilters, tasks } = useTaskStore();
  const location = useLocation();
  const isDailyView = !location.pathname.split('/')[2] || location.pathname.split('/')[2] === 'daily';
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  // Get all unique tags from tasks
  const availableTags = React.useMemo(() => {
    const tagSet = new Set();
    tasks.forEach(task => {
      if (task.tags) {
        task.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [tasks]);

  if (isDailyView) {
    return (
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',
          width: '100%',
          justifyContent: isMobile ? 'flex-start' : 'flex-end'
        }}
      >
        <FormControl size="small" sx={{ width: isMobile ? '48%' : 100 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ''}
            label="Status"
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: isMobile ? '48%' : 100 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={filters.priority || ''}
            label="Priority"
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="1">High</MenuItem>
            <MenuItem value="2">Medium</MenuItem>
            <MenuItem value="3">Low</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: isMobile ? '48%' : 100 }}>
          <InputLabel>Tags</InputLabel>
          <Select
            multiple
            value={filters.tags || []}
            label="Tags"
            onChange={(e) => handleFilterChange('tags', e.target.value)}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300
                }
              }
            }}
          >
            {availableTags.map((tag) => (
              <MenuItem key={tag} value={tag}>
                <Checkbox checked={(filters.tags || []).indexOf(tag) > -1} />
                <ListItemText primary={tag} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: isMobile ? '48%' : 100 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.type || ''}
            label="Type"
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="*">Task (*)</MenuItem>
            <MenuItem value="@">Event (@)</MenuItem>
            <MenuItem value="-">Note (-)</MenuItem>
            <MenuItem value="?">Question (?)</MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  }

  // Full filter set for other views
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel>Search</InputLabel>
        <Select
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="*">Task (*)</MenuItem>
          <MenuItem value="@">Event (@)</MenuItem>
          <MenuItem value="-">Note (-)</MenuItem>
          <MenuItem value="?">Question (?)</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status || ''}
          label="Status"
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={filters.priority || ''}
          label="Priority"
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="1">High</MenuItem>
          <MenuItem value="2">Medium</MenuItem>
          <MenuItem value="3">Low</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Tags</InputLabel>
        <Select
          multiple
          value={filters.tags || []}
          label="Tags"
          onChange={(e) => handleFilterChange('tags', e.target.value)}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300
              }
            }
          }}
        >
          {availableTags.map((tag) => (
            <MenuItem key={tag} value={tag}>
              <Checkbox checked={(filters.tags || []).indexOf(tag) > -1} />
              <ListItemText primary={tag} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Type</InputLabel>
        <Select
          value={filters.type || ''}
          label="Type"
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="*">Task (*)</MenuItem>
          <MenuItem value="@">Event (@)</MenuItem>
          <MenuItem value="-">Note (-)</MenuItem>
          <MenuItem value="?">Question (?)</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default TaskFilters;