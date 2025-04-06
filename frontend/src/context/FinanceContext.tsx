import React, { createContext, useContext, useState, useEffect } from 'react';
import { incomeService, expenseService, goalService, budgetService } from '../services/api';
import { useAuth } from './AuthContext';

// Define the shape of our context data
interface FinanceContextType {
  income: any[];
  expenses: any[];
  goals: any[];
  budgets: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

// Create Context with default values
const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Provider Component
export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [income, setIncome] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) {
      console.log("No user found in FinanceContext, skipping data fetch");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("Starting to fetch financial data for user:", user.id);
      
      // Wrap each API call in a try/catch to ensure all data fetching attempts happen
      let incomeData = [], expensesData = [], goalsData = [], budgetsData = [];
      
      try {
        console.log("Fetching income data...");
        const incomeRes = await incomeService.getAll();
        console.log("Raw income response status:", incomeRes.status);
        console.log("Raw income response data type:", typeof incomeRes.data);
        console.log("Raw income response data:", incomeRes.data);
        
        // Check if the response has data and it's in the expected format
        if (incomeRes && incomeRes.data !== undefined) {
          // Handle both array responses and responses where data is nested
          if (Array.isArray(incomeRes.data)) {
            incomeData = incomeRes.data;
          } else if (incomeRes.data.results && Array.isArray(incomeRes.data.results)) {
            // Some DRF APIs return paginated results with a 'results' property
            incomeData = incomeRes.data.results;
          } else if (typeof incomeRes.data === 'object' && incomeRes.data !== null) {
            // It could be a single item
            if (incomeRes.data.id || incomeRes.data._id) {
              incomeData = [incomeRes.data];
            } else if (incomeRes.data.income && Array.isArray(incomeRes.data.income)) {
              // It might be wrapped in a property called 'income'
              incomeData = incomeRes.data.income;
            } else {
              // Try to handle case where response is { "key1": {...}, "key2": {...} }
              const potentialItems = Object.values(incomeRes.data).filter(
                item => typeof item === 'object' && item !== null
              );
              if (potentialItems.length > 0) {
                incomeData = potentialItems;
              }
            }
          } else if (incomeRes.data === '') {
            // Empty string response, usually means no data
            console.log("Empty string response for income data");
            incomeData = [];
          }
          console.log("Income data processed, count:", incomeData.length);
        }
      } catch (err) {
        console.error("Error fetching income data:", err);
      }
      
      try {
        console.log("Fetching expenses data...");
        const expensesRes = await expenseService.getAll();
        console.log("Raw expenses response status:", expensesRes.status);
        console.log("Raw expenses response data type:", typeof expensesRes.data);
        console.log("Raw expenses response data:", expensesRes.data);
        
        if (expensesRes && expensesRes.data !== undefined) {
          // Handle both array responses and responses where data is nested
          if (Array.isArray(expensesRes.data)) {
            expensesData = expensesRes.data;
          } else if (expensesRes.data.results && Array.isArray(expensesRes.data.results)) {
            expensesData = expensesRes.data.results;
          } else if (typeof expensesRes.data === 'object' && expensesRes.data !== null) {
            // It could be a single item
            if (expensesRes.data.id || expensesRes.data._id) {
              expensesData = [expensesRes.data];
            } else if (expensesRes.data.expenses && Array.isArray(expensesRes.data.expenses)) {
              // It might be wrapped in a property called 'expenses'
              expensesData = expensesRes.data.expenses;
            } else {
              // Try to handle case where response is { "key1": {...}, "key2": {...} }
              const potentialItems = Object.values(expensesRes.data).filter(
                item => typeof item === 'object' && item !== null
              );
              if (potentialItems.length > 0) {
                expensesData = potentialItems;
              }
            }
          } else if (expensesRes.data === '') {
            // Empty string response, usually means no data
            console.log("Empty string response for expenses data");
            expensesData = [];
          }
          console.log("Expenses data processed, count:", expensesData.length);
        }
      } catch (err) {
        console.error("Error fetching expenses data:", err);
      }
      
      try {
        console.log("Fetching goals data...");
        const goalsRes = await goalService.getAll();
        console.log("Raw goals response status:", goalsRes.status);
        console.log("Raw goals response data type:", typeof goalsRes.data);
        console.log("Raw goals response data:", goalsRes.data);
        
        if (goalsRes && goalsRes.data !== undefined) {
          // Handle both array responses and responses where data is nested
          if (Array.isArray(goalsRes.data)) {
            goalsData = goalsRes.data;
          } else if (goalsRes.data.results && Array.isArray(goalsRes.data.results)) {
            goalsData = goalsRes.data.results;
          } else if (typeof goalsRes.data === 'object' && goalsRes.data !== null) {
            // It could be a single item
            if (goalsRes.data.id || goalsRes.data._id) {
              goalsData = [goalsRes.data];
            } else if (goalsRes.data.goals && Array.isArray(goalsRes.data.goals)) {
              // It might be wrapped in a property called 'goals'
              goalsData = goalsRes.data.goals;
            } else {
              // Try to handle case where response is { "key1": {...}, "key2": {...} }
              const potentialItems = Object.values(goalsRes.data).filter(
                item => typeof item === 'object' && item !== null
              );
              if (potentialItems.length > 0) {
                goalsData = potentialItems;
              }
            }
          } else if (goalsRes.data === '') {
            // Empty string response, usually means no data
            console.log("Empty string response for goals data");
            goalsData = [];
          }
          console.log("Goals data processed, count:", goalsData.length);
        }
      } catch (err) {
        console.error("Error fetching goals data:", err);
      }
      
      try {
        console.log("Fetching budgets data...");
        const budgetsRes = await budgetService.getAll();
        console.log("Raw budgets response status:", budgetsRes.status);
        console.log("Raw budgets response data type:", typeof budgetsRes.data);
        console.log("Raw budgets response data:", budgetsRes.data);
        
        if (budgetsRes && budgetsRes.data !== undefined) {
          // Handle both array responses and responses where data is nested
          if (Array.isArray(budgetsRes.data)) {
            budgetsData = budgetsRes.data;
          } else if (budgetsRes.data.results && Array.isArray(budgetsRes.data.results)) {
            budgetsData = budgetsRes.data.results;
          } else if (typeof budgetsRes.data === 'object' && budgetsRes.data !== null) {
            // It could be a single item
            if (budgetsRes.data.id || budgetsRes.data._id) {
              budgetsData = [budgetsRes.data];
            } else if (budgetsRes.data.budgets && Array.isArray(budgetsRes.data.budgets)) {
              // It might be wrapped in a property called 'budgets'
              budgetsData = budgetsRes.data.budgets;
            } else {
              // Try to handle case where response is { "key1": {...}, "key2": {...} }
              const potentialItems = Object.values(budgetsRes.data).filter(
                item => typeof item === 'object' && item !== null
              );
              if (potentialItems.length > 0) {
                budgetsData = potentialItems;
              }
            }
          } else if (budgetsRes.data === '') {
            // Empty string response, usually means no data
            console.log("Empty string response for budgets data");
            budgetsData = [];
          }
          console.log("Budgets data processed, count:", budgetsData.length);
        }
      } catch (err) {
        console.error("Error fetching budgets data:", err);
      }

      // Set state with the retrieved data
      setIncome(incomeData);
      setExpenses(expensesData);
      setGoals(goalsData);
      setBudgets(budgetsData);
      
      console.log("All financial data fetched and state updated");
    } catch (err) {
      console.error('Error in overall fetchData process:', err);
      setError('Failed to fetch financial data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const refreshData = async () => {
    await fetchData();
  };

  return (
    <FinanceContext.Provider
      value={{
        income,
        expenses,
        goals,
        budgets,
        loading,
        error,
        refreshData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

// Hook to use Finance Context
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
