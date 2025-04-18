import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  TextField,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Fade,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Close as CloseIcon,
  Assignment as TaskIcon,
  Event as EventIcon,
  Flag as FlagIcon,
  Schedule as ScheduleIcon,
  Label as TagIcon
} from '@mui/icons-material';
import { useTaskContext } from '../../context/TaskContext';

const QuickEntry = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { createTask } = useTaskContext();

  // Keyboard shortcut handler (Ctrl/Cmd + K)
  const handleKeyPress = useCallback((event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    // Add keyboard shortcut listener
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Natural language parsing (basic implementation)
  const parseInput = (text) => {
    const patterns = {
      priority: /!(high|medium|low)/i,
      dateTime: /\/(today|tomorrow|next-week|next-month|next-(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)|(?:\d{1,2})(?:st|nd|rd|th)?|\d{4}-\d{2}-\d{2})\s*(\d{1,2}(?::\d{2})?)(?:\s*(am|pm))?/i,
      timeMarker: /\b(am|pm)\b/i,
      tags: /#(\w+)/g,
      type: /([*@<>\-!?#])/
    };

    const parsed = {
      content: text,
      priority: null, // Remove default priority
      dueDate: null,
      tags: [],
      signifier: '*' // default task
    };

    // Helper function to get next occurrence of a day
    const getNextDayOccurrence = (targetDay, shouldSkipThisWeek = false) => {
      const today = new Date();
      const currentDay = today.getDay();
      let daysUntilTarget = targetDay - currentDay;

      if (daysUntilTarget <= 0 || shouldSkipThisWeek) {
        daysUntilTarget += 7;
      }

      const nextOccurrence = new Date(today);
      nextOccurrence.setDate(today.getDate() + daysUntilTarget);
      return nextOccurrence;
    };

    // Helper function to parse day names to numbers
    const dayNameToNumber = {
      'sunday': 0, 'sun': 0,
      'monday': 1, 'mon': 1,
      'tuesday': 2, 'tue': 2,
      'wednesday': 3, 'wed': 3,
      'thursday': 4, 'thu': 4,
      'friday': 5, 'fri': 5,
      'saturday': 6, 'sat': 6
    };

    // Extract date and time
    const dateTimeMatch = text.match(patterns.dateTime);
    if (dateTimeMatch) {
      const [fullMatch, dateStr, timeStr, meridian] = dateTimeMatch;
      let date = new Date();
      const dateLower = dateStr.toLowerCase();

      // Handle date part
      if (dateLower === 'today') {
        // Use today's date
      } else if (dateLower === 'tomorrow') {
        date.setDate(date.getDate() + 1);
      } else if (dateLower === 'next-week') {
        // Set to next Monday
        date = getNextDayOccurrence(1, true);
      } else if (dateLower === 'next-month') {
        // Set to 1st of next month
        date.setMonth(date.getMonth() + 1);
        date.setDate(1);
      } else if (dateLower.startsWith('next-')) {
        // Handle "next-monday", "next-tuesday", etc.
        const dayName = dateLower.substring(5);
        const dayNum = dayNameToNumber[dayName];
        if (dayNum !== undefined) {
          date = getNextDayOccurrence(dayNum, true);
        }
      } else if (dayNameToNumber[dateLower] !== undefined) {
        // Handle "monday", "tuesday", etc.
        date = getNextDayOccurrence(dayNameToNumber[dateLower]);
      } else if (/^\d{1,2}(?:st|nd|rd|th)?$/.test(dateLower)) {
        // Handle "14th", "1st", etc.
        const dayNum = parseInt(dateLower);
        const today = new Date();
        date = new Date(today.getFullYear(), today.getMonth(), dayNum);

        // If the date has passed, move to next month
        if (date < today) {
          date.setMonth(date.getMonth() + 1);
        }
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateLower)) {
        date = new Date(dateLower);
      }

      // Handle time part if provided
      if (timeStr) {
        let timeText = timeStr;
        let meridianText = meridian;

        // Check for standalone meridian marker after the time
        if (!meridianText) {
          const remainingText = text.substring(text.indexOf(fullMatch) + fullMatch.length);
          const markerMatch = remainingText.match(patterns.timeMarker);
          if (markerMatch) {
            meridianText = markerMatch[1];
            // Remove the standalone meridian marker from content
            parsed.content = text.replace(markerMatch[0], '');
          }
        }

        const timeParts = timeText.match(/(\d{1,2})(?::(\d{2}))?/);
        if (timeParts) {
          let hours = parseInt(timeParts[1]);
          const minutes = parseInt(timeParts[2] || '0');

          // Convert to 24-hour format if needed
          if (meridianText) {
            const meridianLower = meridianText.toLowerCase();
            if (meridianLower === 'pm' && hours < 12) hours += 12;
            if (meridianLower === 'am' && hours === 12) hours = 0;
          }

          date.setHours(hours, minutes, 0, 0);
        }
      } else {
        // If no time provided, set to start of day
        date.setHours(9, 0, 0, 0);
      }

      parsed.dueDate = date;
      parsed.content = parsed.content.replace(fullMatch, '').trim();
    }

    // Extract priority
    const priorityMatch = parsed.content.match(patterns.priority);
    if (priorityMatch) {
      const priority = priorityMatch[1].toLowerCase();
      parsed.priority = priority === 'high' ? 1 : priority === 'low' ? 3 : 2;
      parsed.content = parsed.content.replace(patterns.priority, '').trim();
    }

    // Extract tags
    const tagMatches = parsed.content.matchAll(patterns.tags);
    for (const match of tagMatches) {
      parsed.tags.push(match[1]);
    }
    parsed.content = parsed.content.replace(patterns.tags, '').trim();

    // Extract type - look for the first valid signifier in the remaining content
    const typeMatch = parsed.content.match(patterns.type);
    if (typeMatch) {
      parsed.signifier = typeMatch[1];
      parsed.content = parsed.content.replace(typeMatch[1], '').trim();
    }

    return parsed;
  };

  const handleInputChange = (event) => {
    const newInput = event.target.value;
    setInput(newInput);

    // Parse input and update suggestions
    if (newInput.trim()) {
      const parsed = parseInput(newInput);
      const newSuggestions = [];

      // Add task type suggestion
      newSuggestions.push({
        type: 'type',
        icon: parsed.signifier === '@' ? <EventIcon /> : <TaskIcon />,
        primary: `Create ${parsed.signifier === '@' ? 'event' : 'task'}`,
        secondary: parsed.content
      });

      // Only add priority suggestion if explicitly set
      if (parsed.priority !== null) {
        newSuggestions.push({
          type: 'priority',
          icon: <FlagIcon />,
          primary: `Priority: ${parsed.priority === 1 ? 'High' : parsed.priority === 3 ? 'Low' : 'Medium'}`,
          secondary: 'Click to change priority'
        });
      }

      // Add due date suggestion if detected
      if (parsed.dueDate) {
        newSuggestions.push({
          type: 'date',
          icon: <ScheduleIcon />,
          primary: 'Due date:',
          secondary: parsed.dueDate.toLocaleDateString()
        });
      }

      // Add tags suggestion if detected
      if (parsed.tags.length > 0) {
        newSuggestions.push({
          type: 'tags',
          icon: <TagIcon />,
          primary: 'Tags:',
          secondary: parsed.tags.join(', ')
        });
      }

      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input.trim()) return;

    try {
      const taskData = parseInput(input);
      await createTask(taskData);
      setInput('');
      setOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      TransitionComponent={Fade}
      fullWidth
      maxWidth="sm"
    >
      <DialogContent>
        <Box sx={{ position: 'relative' }}>
          <Tooltip title="Close (Esc)">
            <IconButton
              sx={{ position: 'absolute', right: 0, top: 0 }}
              onClick={() => setOpen(false)}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>

          <Typography variant="h6" sx={{ mb: 2 }}>
            Quick Add Task
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              autoFocus
              fullWidth
              placeholder="Type your task... (e.g., *Buy groceries #shopping !high @2024-04-20)"
              value={input}
              onChange={handleInputChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </form>

          {suggestions.length > 0 && (
            <Paper variant="outlined" sx={{ mt: 2 }}>
              <List dense>
                {suggestions.map((suggestion, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>{suggestion.icon}</ListItemIcon>
                    <ListItemText
                      primary={suggestion.primary}
                      secondary={suggestion.secondary}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Pro tips:
            <br />• Use * for tasks, @ for events, ! for priority, etc.
            <br />• Add #tags for categorization
            <br />• Add @YYYY-MM-DD for due date
            <br />• Use !high, !medium, or !low for priority
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QuickEntry;