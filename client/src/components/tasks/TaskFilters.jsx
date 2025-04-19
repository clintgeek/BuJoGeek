import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
  IconButton,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTaskContext } from '../../context/TaskContext.jsx';

const TaskFilters = () => {
  const {
    filters,
    updateFilters,
    clearFilters
  } = useTaskContext();

  const handleStatusChange = (event) => {
    updateFilters({ status: event.target.value });
  };

  const handlePriorityChange = (event) => {
    updateFilters({ priority: event.target.value });
  };

  const handleSignifierChange = (event) => {
    updateFilters({ signifier: event.target.value });
  };

  const handleSearchChange = (event) => {
    updateFilters({ search: event.target.value });
  };

  const handleTagChange = (event) => {
    const tags = event.target.value.split(',').map(tag => tag.trim());
    updateFilters({ tags });
  };

  const clearSearch = () => {
    updateFilters({ search: '' });
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          size="small"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: filters.search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={clearSearch}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ''}
            onChange={handleStatusChange}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="migrated">Migrated</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={filters.priority || ''}
            onChange={handlePriorityChange}
            label="Priority"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value={1}>High</MenuItem>
            <MenuItem value={2}>Medium</MenuItem>
            <MenuItem value={3}>Low</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.signifier || ''}
            onChange={handleSignifierChange}
            label="Type"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="*">Task (*)</MenuItem>
            <MenuItem value="@">Event (@)</MenuItem>
            <MenuItem value="x">Completed (x)</MenuItem>
            <MenuItem value="<">Migrated ({'<'})</MenuItem>
            <MenuItem value={'>'}>{`Scheduled (>)`}</MenuItem>
            <MenuItem value="-">Note (-)</MenuItem>
            <MenuItem value="!">Priority (!)</MenuItem>
            <MenuItem value="?">Question (?)</MenuItem>
            <MenuItem value="#">Tagged (#)</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Tags"
          placeholder="tag1, tag2"
          value={filters.tags?.join(', ') || ''}
          onChange={handleTagChange}
        />

        <Button
          variant="outlined"
          onClick={clearFilters}
          startIcon={<ClearIcon />}
        >
          Clear Filters
        </Button>
      </Stack>

      {filters.tags?.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1}>
            {filters.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => {
                  const newTags = filters.tags.filter((_, i) => i !== index);
                  updateFilters({ tags: newTags });
                }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default TaskFilters;