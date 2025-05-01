import { create } from 'zustand';
import axios from 'axios';
import { format, startOfYear, endOfYear, isSameYear } from 'date-fns';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  currentView: 'all',
  currentDate: new Date(),
  filters: {
    search: '',
    status: '',
    priority: ''
  },

  // Set the current view and date
  setView: async (viewType, date) => {
    const { currentView, currentDate } = get();

    // Don't update if the view and date haven't changed
    if (currentView === viewType &&
        ((viewType === 'year' && isSameYear(currentDate, date)) ||
         (viewType !== 'year' && format(currentDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')))) {
      return;
    }

    set({ loading: true, error: null });
    try {
      let endpoint = '/tasks';
      let params = {};

      // Handle different view types
      if (viewType === 'daily') {
        endpoint += '/daily';
        params.date = format(date, 'yyyy-MM-dd');
      } else if (viewType === 'weekly') {
        endpoint += '/weekly';
        params.date = format(date, 'yyyy-MM-dd');
      } else if (viewType === 'monthly') {
        endpoint += '/monthly';
        params.date = format(date, 'yyyy-MM-dd');
      } else if (viewType === 'year') {
        // For year view, we'll fetch all tasks for the year
        const yearStart = startOfYear(date);
        const yearEnd = endOfYear(date);
        params.startDate = format(yearStart, 'yyyy-MM-dd');
        params.endDate = format(yearEnd, 'yyyy-MM-dd');
      }

      const response = await api.get(endpoint, { params });
      set({
        tasks: response.data,
        loading: false,
        currentView: viewType,
        currentDate: date
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  // Set filters
  setFilters: (newFilters) => {
    set({ filters: newFilters });
    get().fetchTasks();
  },

  // Fetch tasks for the current view
  fetchTasks: async () => {
    const { currentView, currentDate, filters } = get();
    set({ loading: true, error: null });

    try {
      let endpoint = '/tasks';
      if (currentView !== 'all') {
        endpoint = `/tasks/${currentView}`;
      }

      const response = await api.get(endpoint, {
        params: {
          date: format(currentDate, 'yyyy-MM-dd'),
          ...filters
        }
      });

      // For daily view, ensure we have an array
      // For other views, preserve the data structure
      const tasks = currentView === 'daily'
        ? (Array.isArray(response.data) ? response.data : [])
        : response.data;

      set({ tasks, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false, tasks: [] });
    }
  },

  // Create a new task
  createTask: async (taskData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/tasks', taskData);
      set(state => ({
        tasks: [...state.tasks, response.data],
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update a task
  updateTask: async (taskId, updateData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.put(`/tasks/${taskId}`, updateData);
      set(state => ({
        tasks: state.tasks.map(task =>
          task._id === taskId ? response.data : task
        ),
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/tasks/${taskId}`);
      set(state => ({
        tasks: state.tasks.filter(task => task._id !== taskId),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Update task status
  updateTaskStatus: async (taskId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, { status });
      set(state => ({
        tasks: state.tasks.map(task =>
          task._id === taskId ? response.data : task
        ),
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Error updating task status:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Add a subtask
  addSubtask: async (parentId, subtaskData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/tasks/${parentId}/subtasks`, subtaskData);
      set(state => ({
        tasks: [...state.tasks, response.data],
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Error adding subtask:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Schedule task for a specific date
  migrateToFuture: async (taskId, date) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/tasks/${taskId}/schedule`, { date });
      set(state => ({
        tasks: state.tasks.map(task =>
          task._id === taskId ? response.data : task
        ),
        loading: false
      }));
      return response.data;
    } catch (error) {
      console.error('Error scheduling task:', error);
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

export default useTaskStore;