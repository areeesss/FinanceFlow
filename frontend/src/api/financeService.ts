import apiClient from './apiClient';

export interface FinanceItem {
  id: number;
  name: string;
  amount: number;
  date?: string;
  category?: string;
  description?: string;
}

export interface Budget extends FinanceItem {
  start_date: string;
  end_date: string;
  current_amount: number;
}

export interface Goal extends FinanceItem {
  deadline: string;
  current_amount: number;
  progress: number;
}

// Income
export const getIncomes = async (): Promise<FinanceItem[]> => {
  const response = await apiClient.get('/api/income/');
  return response.data;
};

export const createIncome = async (data: Omit<FinanceItem, 'id'>): Promise<FinanceItem> => {
  const response = await apiClient.post('/api/income/', data);
  return response.data;
};

// Expenses
export const getExpenses = async (): Promise<FinanceItem[]> => {
  const response = await apiClient.get('/api/expenses/');
  return response.data;
};

export const createExpense = async (data: Omit<FinanceItem, 'id'>): Promise<FinanceItem> => {
  const response = await apiClient.post('/api/expenses/', data);
  return response.data;
};

// Budgets
export const getBudgets = async (): Promise<Budget[]> => {
  const response = await apiClient.get('/api/budgets/');
  return response.data;
};

export const createBudget = async (data: Omit<Budget, 'id'>): Promise<Budget> => {
  const response = await apiClient.post('/api/budgets/', data);
  return response.data;
};

// Goals
export const getGoals = async (): Promise<Goal[]> => {
  const response = await apiClient.get('/api/goals/');
  return response.data;
};

export const createGoal = async (data: Omit<Goal, 'id'>): Promise<Goal> => {
  const response = await apiClient.post('/api/goals/', data);
  return response.data;
};