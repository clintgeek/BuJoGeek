import React, { useState, useEffect, useCallback } from 'react';
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
  ListItemIcon,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EventIcon from '@mui/icons-material/Event';
import FlagIcon from '@mui/icons-material/Flag';
import TaskIcon from '@mui/icons-material/Task';
import TagIcon from '@mui/icons-material/Tag';
import { useTaskContext } from '../../context/TaskContext.jsx';

const QuickEntry = ({ open, onClose }) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { createTask } = useTaskContext();

  const parseInput = useCallback((text) => {
    const patterns = {
      priority: /!(high|medium|low)/i,
      dateTime: /\/(today|tomorrow|next-week|next-month|next-(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(?:mon(?:day)?|tue(?:sday)?|wed(?:nesday)?|thu(?:rsday)?|fri(?:day)?|sat(?:urday)?|sun(?:day)?)|(?:\d{1,2})(?:st|nd|rd|th)?|\d{4}-\d{2}-\d{2})\s*(\d{1,2})(?::\d{2})?\s*([ap](?:m)?)?/i,
      timeMarker: /\b([ap](?:m)?)\b/i,
      tags: /#(\w+)/g,
      type: /[*@\-!?]/
    };

    let content = text;
    let dueDate = null;
    let priority = null;
    let type = '*';
    const tags = [];

    // Extract type/signifier (can be anywhere in the text)
    const typeMatch = content.match(patterns.type);
    if (typeMatch) {
      type = typeMatch[0];
      content = content.replace(typeMatch[0], '').trim();
    }

    // Extract priority
    const priorityMatch = content.match(patterns.priority);
    if (priorityMatch) {
      const priorityLevel = priorityMatch[1].toLowerCase();
      priority = priorityLevel === 'high' ? 1 : priorityLevel === 'low' ? 3 : 2;
      content = content.replace(patterns.priority, '').trim();
    }

    // Helper function to get next occurrence of a day
    const getNextDayOccurrence = (targetDay) => {
      const today = new Date();
      const currentDay = today.getDay();
      let daysUntilTarget = targetDay - currentDay;

      if (daysUntilTarget <= 0) {
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
    const dateTimeMatch = content.match(patterns.dateTime);
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
        date.setDate(date.getDate() + 7);
      } else if (dateLower === 'next-month') {
        date.setMonth(date.getMonth() + 1);
      } else if (dateLower.startsWith('next-')) {
        const dayName = dateLower.substring(5);
        const dayNum = dayNameToNumber[dayName];
        if (dayNum !== undefined) {
          date = getNextDayOccurrence(dayNum);
        }
      } else if (dayNameToNumber[dateLower] !== undefined) {
        date = getNextDayOccurrence(dayNameToNumber[dateLower]);
      }

      // Handle time part if provided
      if (timeStr) {
        let hours = parseInt(timeStr);
        let meridianText = meridian?.toLowerCase();

        // Check for standalone meridian marker after the time
        if (!meridianText) {
          const remainingText = content.substring(content.indexOf(fullMatch) + fullMatch.length);
          const markerMatch = remainingText.match(patterns.timeMarker);
          if (markerMatch) {
            meridianText = markerMatch[1].toLowerCase();
          }
        }

        // Convert to 24-hour format if needed
        if (meridianText) {
          if (meridianText.startsWith('p') && hours < 12) hours += 12;
          if (meridianText.startsWith('a') && hours === 12) hours = 0;
        }

        date.setHours(hours, 0, 0, 0);
      } else {
        // If no time provided, set to 9 AM
        date.setHours(9, 0, 0, 0);
      }

      dueDate = date;
      content = content.replace(dateTimeMatch[0], '').trim();
    }

    // Extract tags
    let tagMatch;
    while ((tagMatch = patterns.tags.exec(text)) !== null) {
      tags.push(tagMatch[1]);
      content = content.replace(tagMatch[0], '').trim();
    }

    const newSuggestions = [];

    if (type !== '*') {
      newSuggestions.push({
        type: 'type',
        text: `Type: ${type}`,
        icon: TaskIcon
      });
    }

    if (dueDate) {
      newSuggestions.push({
        type: 'date',
        text: `Due: ${dueDate.toLocaleString()}`,
        icon: EventIcon
      });
    }

    if (priority) {
      newSuggestions.push({
        type: 'priority',
        text: `Priority: ${priority === 1 ? 'High' : priority === 3 ? 'Low' : 'Medium'}`,
        icon: FlagIcon
      });
    }

    if (tags.length > 0) {
      newSuggestions.push({
        type: 'tags',
        text: `Tags: ${tags.join(', ')}`,
        icon: TagIcon
      });
    }

    setSuggestions(newSuggestions);

    return {
      content,
      signifier: type,
      priority,
      dueDate,
      tags
    };
  }, []);

  useEffect(() => {
    parseInput(input);
  }, [input, parseInput]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const taskData = parseInput(input);
      await createTask(taskData);
      setInput('');
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Fade}
      fullWidth
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Quick Add Task</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add your task with optional markers: *, !, #tags, /date"
          multiline
          rows={2}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        {suggestions.length > 0 && (
          <Paper variant="outlined">
            <List dense>
              {suggestions.map((suggestion, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <suggestion.icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={suggestion.text} />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary">
          Tips:
          <br />• Type markers can be anywhere in the text:
          <br />  * (task), @ (event), - (note), ! (priority), ? (question)
          <br />• Dates: /today, /tomorrow, /monday, /next-week
          <br />• Times: 9am, 2pm, 14:00 (defaults to 9am)
          <br />• Priority: !high, !medium, !low
          <br />• Tags: #work, #personal, etc.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default QuickEntry;