import apiClient from '@/api/apiClient';

// Default color utilities for income
const defaultIncomeColors = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Green
  '#6366F1', // Indigo
  '#0EA5E9'  // Light Blue
];

// Get a default income color based on existing items
const getDefaultIncomeColor = (): string => {
  try {
    const existingColors = JSON.parse(localStorage.getItem('incomeColors') || '{}');
    const colorCount = Object.keys(existingColors).length;
    return defaultIncomeColors[colorCount % defaultIncomeColors.length];
  } catch (error) {
    console.error('Error getting default income color:', error);
    return '#3B82F6'; // Default to blue 500 if there's an error
  }
};

export const incomeService = {
  getAll: () => apiClient.get('/income/'),
  
  create: async (data: any) => {
    const formattedData = {
      type: data.type || 'Unnamed Income',
      amount: data.amount || 0,
      description: data.description || `Income from ${data.type || 'unknown source'}`,
      date: data.date || new Date().toISOString().split('T')[0],
      name: data.name || data.type || 'Unnamed Income',
      color: data.color || getDefaultIncomeColor()
    };
    
    try {
      const response = await apiClient.post('/income/', formattedData);
      return response;
    } catch (error: any) {
      console.error('Error creating income:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  update: async (id: string | number, data: any) => {
    const stringId = String(id);
    const formattedData = {
      type: data.type || 'Unnamed Income',
      amount: data.amount || 0,
      description: data.description || `Income from ${data.type || 'unknown source'}`,
      name: data.name || data.type || 'Unnamed Income',
      color: data.color || getDefaultIncomeColor(),
      ...(data.date && { date: data.date }),
      id: stringId
    };
    
    try {
      const response = await apiClient.put(`/income/${stringId}/`, formattedData);
      return response;
    } catch (error: any) {
      console.error('Error updating income:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  delete: async (id: string | number) => {
    const stringId = String(id);
    try {
      const response = await apiClient.delete(`/income/${stringId}/`);
      return response;
    } catch (error: any) {
      console.error('Error deleting income:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  }
}; 