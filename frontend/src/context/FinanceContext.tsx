import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of our context data
interface FinanceContextType {
  incomeData: { id: number; type: string; amount: number }[];
  expensesData: { id: number; type: string; amount: number }[];
  totalIncome: number;
  totalExpenses: number;
  updateIncome: (data: any[]) => void;
  updateExpenses: (data: any[]) => void;
}

// Create Context with default values
const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Provider Component
export const FinanceProvider = ({ children }: { children: ReactNode }) => {
  const [incomeData, setIncomeData] = useState([
    { id: 1, type: "Salary", amount: 5000 },
    { id: 2, type: "Freelance", amount: 2000 },
  ]);
  
  const [expensesData, setExpensesData] = useState([
    { id: 1, type: "Rent", amount: 1500 },
    { id: 2, type: "Food", amount: 800 },
  ]);

  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expensesData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <FinanceContext.Provider value={{ incomeData, expensesData, totalIncome, totalExpenses, updateIncome: setIncomeData, updateExpenses: setExpensesData }}>
      {children}
    </FinanceContext.Provider>
  );
};

// Hook to use Finance Context
export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error("useFinance must be used within a FinanceProvider");
  return context;
};
