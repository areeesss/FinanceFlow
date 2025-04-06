import React, { createContext, useContext, useState } from 'react';
import { incomeService, expenseService, goalService, budgetService } from '../services/api';
import { useAuth } from './AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Define types for the financial data
interface Income {
  id: string;
  name: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
  color?: string;
}

interface Expense {
  id: string;
  name: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
  color?: string;
}

interface Goal {
  id: string;
  name: string;
  targetAmount?: number;
  target_amount?: number;
  amountSaved?: number;
  current_amount?: number;
  deadline?: string;
  description?: string;
  color?: string;
}

interface BudgetItem {
  id: string;
  category: string;
  planned: number;
  actual: number;
  remaining?: number;
  progress?: number;
  color?: string;
}

interface Budget {
  id: string;
  name: string;
  period: string;
  totalPlanned?: number;
  target_amount?: number;
  totalActual?: number;
  current_amount?: number;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  items?: BudgetItem[];
  description?: string;
}

// Define the shape of our context data
interface FinanceContextType {
  income: Income[];
  expenses: Expense[];
  goals: Goal[];
  budgets: Budget[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

// Create Context with default values
const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Process API response to handle different formats
const processApiResponse = <T extends unknown>(response: any): T[] => {
  if (!response || response.data === undefined) return [];

  // Handle different response formats
  if (Array.isArray(response.data)) {
    return response.data as T[];
  } 
  
  if (response.data.results && Array.isArray(response.data.results)) {
    return response.data.results as T[];
  } 
  
  if (typeof response.data === 'object' && response.data !== null) {
    // Handle single item
    if (response.data.id || response.data._id) {
      return [response.data] as T[];
    }
    
    // Handle nested data under a specific property name
    const dataKeys = ['income', 'expenses', 'goals', 'budgets'];
    for (const key of dataKeys) {
      if (response.data[key] && Array.isArray(response.data[key])) {
        return response.data[key] as T[];
      }
    }
    
    // Handle object of objects case
    const potentialItems = Object.values(response.data).filter(
      item => typeof item === 'object' && item !== null
    );
    
    if (potentialItems.length > 0) {
      return potentialItems as T[];
    }
  }
  
  // Return empty array as fallback
  return [];
};

// Generate test data if no real data exists
const generateTestData = () => {
  console.log("Generating test data for development");
  
  // Test income data with a variety of colors from the color selector
  const incomeData = [
    {
      id: 'test-income-1',
      name: 'Salary',
      type: 'Salary',
      amount: 5000,
      date: new Date().toISOString().split('T')[0],
      description: 'Monthly salary payment',
      color: '#3B82F6' // Blue
    },
    {
      id: 'test-income-2',
      name: 'Freelance',
      type: 'Freelance',
      amount: 1200,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Website development project',
      color: '#8B5CF6' // Purple
    },
    {
      id: 'test-income-3',
      name: 'Investments',
      type: 'Investments',
      amount: 800,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Dividend payments',
      color: '#10B981' // Green
    }
  ];
  
  // Test expense data with a variety of colors from the color selector
  const expensesData = [
    {
      id: 'test-expense-1',
      name: 'Rent',
      type: 'Housing',
      amount: 1500,
      date: new Date().toISOString().split('T')[0],
      description: 'Monthly apartment rent',
      color: '#EF4444' // Red
    },
    {
      id: 'test-expense-2',
      name: 'Groceries',
      type: 'Food',
      amount: 350,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Weekly grocery shopping',
      color: '#F59E0B' // Amber/Orange
    },
    {
      id: 'test-expense-3',
      name: 'Transportation',
      type: 'Transportation',
      amount: 250,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Car payment and gas',
      color: '#6366F1' // Indigo
    }
  ];
  
  // Test goal data
  const goalsData = [
    {
      id: 'test-goal-1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      amountSaved: 6500,
      current_amount: 6500,
      target_amount: 10000,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Three months of expenses for emergencies',
      color: '#0EA5E9' // Light Blue
    },
    {
      id: 'test-goal-2',
      name: 'New Car',
      targetAmount: 25000,
      amountSaved: 12000,
      current_amount: 12000,
      target_amount: 25000,
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Saving for a new car',
      color: '#EC4899' // Pink
    }
  ];
  
  // Test budget data with nice colors
  const budgetsData = [
    {
      id: 'test-budget-1',
      name: 'Monthly Budget',
      period: 'monthly',
      totalPlanned: 3000,
      totalActual: 2800,
      target_amount: 3000,
      current_amount: 2800,
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        {
          id: 'test-budget-item-1',
          category: 'Housing',
          planned: 1500,
          actual: 1500,
          remaining: 0,
          progress: 100,
          color: '#3B82F6' // Blue
        },
        {
          id: 'test-budget-item-2',
          category: 'Food',
          planned: 500,
          actual: 350,
          remaining: 150,
          progress: 70,
          color: '#F59E0B' // Amber/Orange
        },
        {
          id: 'test-budget-item-3',
          category: 'Transportation',
          planned: 300,
          actual: 250,
          remaining: 50,
          progress: 83,
          color: '#10B981' // Green
        }
      ]
    }
  ];
  
  return {
    incomeData,
    expensesData,
    goalsData,
    budgetsData
  };
};

// Provider Component
export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch income data using React Query
  const { 
    data: income = [], 
    isLoading: incomeLoading,
    error: incomeError
  } = useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      try {
        console.log("Fetching income data...");
        const response = await incomeService.getAll();
        console.log("Income data fetched:", response);
        return processApiResponse<Income>(response);
      } catch (error) {
        console.error("Error fetching income:", error);
        throw error;
      }
    },
    enabled: !!user, // Only run if user is logged in
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch expenses data using React Query
  const { 
    data: expenses = [], 
    isLoading: expensesLoading,
    error: expensesError
  } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      try {
        console.log("Fetching expenses data...");
        const response = await expenseService.getAll();
        console.log("Expenses data fetched:", response);
        return processApiResponse<Expense>(response);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }
    },
    enabled: !!user, // Only run if user is logged in
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch goals data using React Query
  const { 
    data: goals = [], 
    isLoading: goalsLoading,
    error: goalsError
  } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      try {
        console.log("Fetching goals data...");
        const response = await goalService.getAll();
        console.log("Goals data fetched:", response);
        return processApiResponse<Goal>(response);
      } catch (error) {
        console.error("Error fetching goals:", error);
        throw error;
      }
    },
    enabled: !!user, // Only run if user is logged in
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch budgets data using React Query
  const { 
    data: budgets = [], 
    isLoading: budgetsLoading,
    error: budgetsError
  } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      try {
        console.log("Fetching budgets data...");
        const response = await budgetService.getAll();
        console.log("Budgets data fetched:", response);
        return processApiResponse<Budget>(response);
      } catch (error) {
        console.error("Error fetching budgets:", error);
        throw error;
      }
    },
    enabled: !!user, // Only run if user is logged in
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If there's no data from the API, use test data for development
  const isEmptyData = 
    income.length === 0 && 
    expenses.length === 0 && 
    goals.length === 0 && 
    budgets.length === 0;

  const finalData = isEmptyData && !incomeLoading && !expensesLoading && !goalsLoading && !budgetsLoading
    ? generateTestData()
    : { incomeData: income, expensesData: expenses, goalsData: goals, budgetsData: budgets };

  // Refresh data function for manual refreshes
  const refreshData = async () => {
    setError(null);
    try {
      await queryClient.invalidateQueries({ queryKey: ['income'] });
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
      await queryClient.invalidateQueries({ queryKey: ['goals'] });
      await queryClient.invalidateQueries({ queryKey: ['budgets'] });
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh financial data. Please try again later.");
    }
  };

  // Combine all errors
  const combinedError = incomeError || expensesError || goalsError || budgetsError || error;
  if (combinedError) {
    console.error("Error in financial data:", combinedError);
  }

  // Set loading state
  const loading = incomeLoading || expensesLoading || goalsLoading || budgetsLoading;

  // Create context value
  const value: FinanceContextType = {
    income: finalData.incomeData as Income[],
    expenses: finalData.expensesData as Expense[],
    goals: finalData.goalsData as Goal[],
    budgets: finalData.budgetsData as Budget[],
    loading,
    error: combinedError ? String(combinedError) : null,
    refreshData
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};

// Custom hook to use the finance context
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
