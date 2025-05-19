import React, { createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { incomeService } from '@/services/incomeApi';
import { expenseService } from '@/services/expenseApi';
import { goalService } from '@/services/goalApi';
import { budgetService } from '@/services/budgetApi';
import { useAuth } from '@/context/AuthContext';

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

// Provider Component
export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch income data using React Query
  const { 
    data: incomeData = [], 
    isLoading: incomeLoading,
    error: incomeError
  } = useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      try {
        const response = await incomeService.getAll();
        return processApiResponse<Income>(response);
      } catch (error) {
        console.error("Error fetching income:", error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch expenses data using React Query
  const { 
    data: expensesData = [], 
    isLoading: expensesLoading,
    error: expensesError
  } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      try {
        const response = await expenseService.getAll();
        return processApiResponse<Expense>(response);
      } catch (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch goals data using React Query
  const { 
    data: goalsData = [], 
    isLoading: goalsLoading,
    error: goalsError
  } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      try {
        const response = await goalService.getAll();
        return processApiResponse<Goal>(response);
      } catch (error) {
        console.error("Error fetching goals:", error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch budgets data using React Query
  const { 
    data: budgetsData = [], 
    isLoading: budgetsLoading,
    error: budgetsError
  } = useQuery({
    queryKey: ['budgets'],
    queryFn: async () => {
      try {
        const response = await budgetService.getAll();
        return processApiResponse<Budget>(response);
      } catch (error) {
        console.error("Error fetching budgets:", error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const finalData = {
    incomeData,
    expensesData,
    goalsData,
    budgetsData
  };

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
