import apiClient from '@/api/apiClient';

export const goalService = {
  getAll: () => apiClient.get('/goals/'),
  
  create: async (data: any) => {
    try {
      const response = await apiClient.post('/goals/', data);
      return response;
    } catch (error: any) {
      console.error('Error creating goal:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  update: async (id: string, data: any) => {
    try {
      const response = await apiClient.put(`/goals/${id}/`, data);
      return response;
    } catch (error: any) {
      console.error('Error updating goal:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await apiClient.delete(`/goals/${id}/`);
      return response;
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      if (error.response) {
        console.error('Server response:', error.response.status, error.response.data);
      }
      throw error;
    }
  }
}; 