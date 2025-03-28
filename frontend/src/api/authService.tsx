import apiClient from './apiClient';

interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  full_name: string;
  email: string;
  username: string;
  password: string;
  password2: string; // Added this
}

interface TokenResponse {
  access: string;
  refresh: string;
  user: User;
}

export const login = async (data: LoginData): Promise<TokenResponse> => {
  try {
    const response = await apiClient.post('/login/', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

export const register = async (data: SignupData): Promise<TokenResponse> => {
  try {
    const response = await apiClient.post('/register/', {
      full_name: data.full_name,
      email: data.email,
      username: data.username,
      password: data.password,
      password2: data.password2 // Added this
    });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    let errorMessage = 'Registration failed';
    
    if (errorData) {
      if (errorData.email) errorMessage = errorData.email[0];
      else if (errorData.username) errorMessage = errorData.username[0];
      else if (errorData.password) errorMessage = errorData.password[0];
      else if (errorData.non_field_errors) errorMessage = errorData.non_field_errors[0];
    }
    
    throw new Error(errorMessage);
  }
};

export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/logout/');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get('/user/');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch user');
  }
};

export const refreshToken = async (): Promise<{ access: string }> => {
  try {
    const response = await apiClient.post('/token/refresh/', {
      refresh: localStorage.getItem('refresh_token')
    });
    return response.data;
  } catch (error) {
    throw new Error('Token refresh failed');
  }
};