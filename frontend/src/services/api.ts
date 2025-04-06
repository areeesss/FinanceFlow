import axios from 'axios';
import apiClient from '../api/apiClient';

const API_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor to include token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    
    // Log the request details
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header added to request');
    } else {
      console.log('No token found in localStorage, request will be sent without Authorization header');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Update response interceptor with improved error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Don't attempt refresh for auth endpoints or if already retried
    const isAuthEndpoint = 
      originalRequest.url?.includes('/token/') || 
      originalRequest.url?.includes('/login/') || 
      originalRequest.url?.includes('/register/');
    
    // If the error is due to an unauthorized request (401) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      
      try {
        console.log("Attempting to refresh token");
        
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          console.log("No refresh token found");
          // No refresh token, redirect to login
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          throw new Error("No refresh token found");
        }

        // Make a direct axios call to avoid the interceptor loop
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken
        });
        
        if (response.data && response.data.access) {
          console.log("Token refreshed successfully");
          // Update the token in localStorage
          localStorage.setItem('access_token', response.data.access);
          
          // Update the authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          // Retry the original request with the new token
          return axios(originalRequest);
        } else {
          console.log("Token refresh response did not contain access token");
          throw new Error("Invalid refresh response");
        }
      } catch (refreshError: any) {
        console.error('Error refreshing token:', refreshError);
        console.error('Error details:', refreshError.response ? refreshError.response.data : 'No response data');
        
        // Clear tokens if refresh fails
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          console.log("Redirecting to login page due to token refresh failure");
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Utility function to get user ID from local storage
const getUserId = (): number | null => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return null;
    
    // For a JWT token, we could decode it to get user info
    // However, for this implementation we'll rely on the backend to 
    // associate the request with the authenticated user
    return null; // Let the backend handle user association
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

// Default color utilities
// Using colors from the color selector that mesh well together
const defaultIncomeColors = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#6366F1', // Indigo
  '#0EA5E9'  // Light Blue
];

const defaultExpenseColors = [
  '#EF4444', // Red
  '#F59E0B', // Amber/Orange
  '#6366F1', // Indigo
  '#EC4899', // Pink
  '#84CC16'  // Lime
];

// Get a default income color based on existing items
const getDefaultIncomeColor = (): string => {
  try {
    // Get existing income from localStorage to determine next color
    const existingColors = JSON.parse(localStorage.getItem('incomeColors') || '{}');
    const colorCount = Object.keys(existingColors).length;
    
    // Return color based on count (cycling through the available colors)
    return defaultIncomeColors[colorCount % defaultIncomeColors.length];
  } catch (error) {
    console.error('Error getting default income color:', error);
    return '#3B82F6'; // Default to blue 500 if there's an error
  }
};

// Get a default expense color based on existing items
const getDefaultExpenseColor = (): string => {
  try {
    // Get existing expenses from localStorage to determine next color
    const existingColors = JSON.parse(localStorage.getItem('expenseColors') || '{}');
    const colorCount = Object.keys(existingColors).length;
    
    // Return color based on count (cycling through the available colors)
    return defaultExpenseColors[colorCount % defaultExpenseColors.length];
  } catch (error) {
    console.error('Error getting default expense color:', error);
    return '#EF4444'; // Default to red 500 if there's an error
  }
};

// Income related API calls
export const incomeService = {
  getAll: () => api.get('/income/'),
  create: async (data: any) => {
    // Standardize data format for backend compatibility
    const formattedData = {
      type: data.type || 'Unnamed Income',
      amount: data.amount || 0,
      description: data.description || `Income from ${data.type || 'unknown source'}`,
      date: data.date || new Date().toISOString().split('T')[0],
      // Add name field as required by Django backend
      name: data.name || data.type || 'Unnamed Income',
      // Include color if provided, or use the default blue shade based on count
      color: data.color || getDefaultIncomeColor()
    };
    
    console.log('Creating income with data:', formattedData);
    try {
      const response = await api.post('/income/', formattedData);
      return response;
    } catch (error: any) {
      console.error('Error details:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },
  update: async (id: string | number, data: any) => {
    // Ensure id is a string
    const stringId = String(id);
    console.log(`Updating income with ID: ${stringId} (original type: ${typeof id})`);
    
    // Standardize data format for backend compatibility
    const formattedData = {
      type: data.type || 'Unnamed Income',
      amount: data.amount || 0,
      description: data.description || `Income from ${data.type || 'unknown source'}`,
      // Add name field as required by Django backend
      name: data.name || data.type || 'Unnamed Income',
      // Include color if provided, or use the default blue shade
      color: data.color || getDefaultIncomeColor(),
      // Only include date if provided, otherwise backend keeps existing
      ...(data.date && { date: data.date }),
      // Include ID in the payload
      id: stringId
    };
    
    console.log('Updating income with data:', formattedData);
    console.log('Original request data:', data);
    
    try {
      const response = await api.put(`/income/${stringId}/`, formattedData);
      console.log('Backend response to update:', response.data);
      return response;
    } catch (error: any) {
      console.error('Error updating income:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },
  delete: async (id: string | number) => {
    // Ensure id is a string
    const stringId = String(id);
    console.log(`Deleting income with ID: ${stringId} (original type: ${typeof id})`);
    
    try {
      const response = await api.delete(`/income/${stringId}/`);
      return response;
    } catch (error: any) {
      console.error('Error deleting income:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },
};

// Expenses related API calls
export const expenseService = {
  getAll: () => api.get('/expenses/'),
  create: async (data: any) => {
    // Standardize data format for backend compatibility
    const formattedData = {
      type: data.type || 'Unnamed Expense',
      amount: data.amount || 0,
      description: data.description || `Expense for ${data.type || 'unknown purpose'}`,
      date: data.date || new Date().toISOString().split('T')[0],
      // Add name field as required by Django backend
      name: data.name || data.type || 'Unnamed Expense',
      // Include color if provided, or use the default red shade based on count
      color: data.color || getDefaultExpenseColor()
    };
    
    console.log('Creating expense with data:', formattedData);
    try {
      const response = await api.post('/expenses/', formattedData);
      return response;
    } catch (error: any) {
      console.error('Error details:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },
  update: async (id: string | number, data: any) => {
    // Ensure id is a string
    const stringId = String(id);
    console.log(`Updating expense with ID: ${stringId} (original type: ${typeof id})`);
    
    // Standardize data format for backend compatibility
    const formattedData = {
      type: data.type || 'Unnamed Expense',
      amount: data.amount || 0,
      description: data.description || `Expense for ${data.type || 'unknown purpose'}`,
      // Add name field as required by Django backend
      name: data.name || data.type || 'Unnamed Expense',
      // Include color if provided, or use the default red shade
      color: data.color || getDefaultExpenseColor(),
      // Only include date if provided, otherwise backend keeps existing
      ...(data.date && { date: data.date }),
      // Include ID in the payload
      id: stringId
    };
    
    console.log('Updating expense with data:', formattedData);
    
    try {
      const response = await api.put(`/expenses/${stringId}/`, formattedData);
      return response;
    } catch (error: any) {
      console.error('Error updating expense:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },
  delete: async (id: string | number) => {
    // Ensure id is a string
    const stringId = String(id);
    console.log(`Deleting expense with ID: ${stringId} (original type: ${typeof id})`);
    
    try {
      const response = await api.delete(`/expenses/${stringId}/`);
      return response;
    } catch (error: any) {
      console.error('Error deleting expense:', error);
      if (error.response) {
        console.error('Server responded with:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },
};

// Goals related API calls
export const goalService = {
  getAll: () => api.get('/goals/'),
  create: (data: any) => {
    console.log('Creating goal with data:', data);
    return api.post('/goals/', data);
  },
  update: (id: string, data: any) => {
    console.log(`Updating goal with ID: ${id}`, data);
    return api.put(`/goals/${id}/`, data);
  },
  delete: (id: string) => api.delete(`/goals/${id}/`),
};

// Budget related API calls
export const budgetService = {
  getAll: () => api.get('/budgets/'),
  create: (data: any) => {
    // Convert frontend model to backend model
    const formattedData = {
      name: data.name,
      target_amount: data.totalPlanned || data.target_amount || 0,
      current_amount: data.totalActual || data.current_amount || 0,
      start_date: data.startDate || data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.endDate || data.end_date || new Date().toISOString().split('T')[0],
      description: data.description || `Budget for ${data.name}`,
      period: data.period || 'monthly',
      items: data.items || [] // Send items to backend
    };
    
    console.log('Creating budget with data:', formattedData);
    return api.post('/budgets/', formattedData);
  },
  update: async (id: number, data: any) => {
    // Convert frontend model to backend model
    const formattedData: any = {
      name: data.name,
      target_amount: data.totalPlanned || data.target_amount || 0,
      current_amount: data.totalActual || data.current_amount || 0,
      start_date: data.startDate || data.start_date || new Date().toISOString().split('T')[0],
      end_date: data.endDate || data.end_date || new Date().toISOString().split('T')[0],
      description: data.description || `Budget for ${data.name}`,
      period: data.period || 'monthly'
    };
    
    // If items are provided, include them in the update
    if (data.items) {
      formattedData.items = data.items;
    }
    
    console.log(`Updating budget with ID: ${id}`, formattedData);
    
    try {
      const response = await api.put(`/budgets/${id}/`, formattedData);
      console.log(`Budget update successful for ID: ${id}`, response.data);
      return response;
    } catch (error: any) {
      console.error(`Error updating budget with ID: ${id}:`, error);
      if (error.response) {
        console.error('Server responded with:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      throw error;
    }
  },
  // Add a specific API call for updating budget items
  updateItems: async (id: number, items: any[]) => {
    console.log(`Updating items for budget ID: ${id}`, items);
    
    try {
      const response = await api.put(`/budgets/${id}/`, { items });
      console.log(`Budget items update successful for ID: ${id}`, response.data);
      return response;
    } catch (error: any) {
      console.error(`Error updating budget items with ID: ${id}:`, error);
      if (error.response) {
        console.error('Server responded with:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      throw error;
    }
  },
  delete: (id: number) => api.delete(`/budgets/${id}/`),
};

// User related API calls
export const userService = {
  getProfile: () => api.get('/user/'),
  updateProfile: (data: any) => api.put('/user/profile/', data),
  updateSettings: (data: any) => api.put('/user/settings/', data),
};

// Add a test function to see what the API expects
export const testAPI = {
  getIncome: async () => {
    try {
      console.log('Fetching income data...');
      const response = await api.get('/income/');
      console.log('GET income full response:', response);
      console.log('GET income response data type:', typeof response.data);
      console.log('GET income response status:', response.status);
      console.log('GET income response headers:', response.headers);
      console.log('GET income response structure:', JSON.stringify(response.data, null, 2));
      // Analyze the structure to determine required fields
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('Example income item structure:', response.data[0]);
        console.log('Required fields appear to be:', Object.keys(response.data[0]).join(', '));
      } else {
        console.log('No income data found or not an array. Response data:', response.data);
      }
      return response.data;
    } catch (error: any) {
      console.error('GET income error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      return null;
    }
  },
  
  postIncome: async () => {
    try {
      // Trying a more Django-compatible structure based on observing GET responses
      const testData = {
        type: 'Test Income',
        amount: 100,
        description: 'Testing income API',
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        name: 'Test Income' // Adding name field
      };
      
      console.log('Attempting to create income with:', testData);
      const response = await api.post('/income/', testData);
      console.log('POST income response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('POST income error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      return null;
    }
  },
  
  getExpenses: async () => {
    try {
      console.log('Fetching expense data...');
      const response = await api.get('/expenses/');
      console.log('GET expenses response structure:', JSON.stringify(response.data, null, 2));
      // Analyze the structure to determine required fields
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('Example expense item structure:', response.data[0]);
        console.log('Required fields appear to be:', Object.keys(response.data[0]).join(', '));
      } else {
        console.log('No expense data found or not an array:', response.data);
      }
      return response.data;
    } catch (error: any) {
      console.error('GET expenses error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      return null;
    }
  }
};

export default api; 