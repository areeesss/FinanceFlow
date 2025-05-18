/**
 * Shared utilities for API handling, data processing, and formatting
 * Used by the custom hooks to avoid duplication of common functions
 */

// Process API response to handle different formats
export const processApiResponse = <T extends unknown>(response: any): T[] => {
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
    
    // Handle nested data
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

// Format currency function with locale and currency options
export const formatCurrency = (amount: number, locale = 'en-PH', currency = 'PHP') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Get random color from a palette
export const getRandomColor = (colors: string[]) => {
  return colors[Math.floor(Math.random() * colors.length)];
};

// Save entity colors to localStorage to maintain consistency
export const saveColors = (key: string, colors: Record<string, string>) => {
  try {
    localStorage.setItem(key, JSON.stringify(colors));
    return true;
  } catch (e) {
    console.error(`Failed to save ${key} colors to localStorage:`, e);
    return false;
  }
};

// Load entity colors from localStorage
export const loadColors = (key: string): Record<string, string> => {
  try {
    const savedColors = localStorage.getItem(key);
    return savedColors ? JSON.parse(savedColors) : {};
  } catch (e) {
    console.error(`Failed to load ${key} colors from localStorage:`, e);
    return {};
  }
};

// Filter data by time period (week, month, year)
export function filterByDatePeriod<T extends { date?: string }>(
  data: T[], 
  period: 'week' | 'month' | 'year'
): T[] {
  const now = new Date();
  let startDate = new Date();
  
  // Set start date based on period
  if (period === 'week') {
    startDate.setDate(now.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(now.getMonth() - 1);
  } else if (period === 'year') {
    startDate.setFullYear(now.getFullYear() - 1);
  }
  
  // Filter by date
  return data.filter(item => {
    if (!item.date) return false;
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= now;
  });
}

// Get monthly data grouping
export function getMonthlyData<T extends { date?: string; amount: number }>(
  data: T[]
): { month: string; total: number }[] {
  const monthlyData: Record<string, number> = {};
  
  // Group by month
  data.forEach(item => {
    if (!item.date) return;
    
    const date = new Date(item.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = 0;
    }
    
    monthlyData[monthKey] += item.amount;
  });
  
  // Convert to array and sort by month
  return Object.entries(monthlyData)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Format date to YYYY-MM-DD 
export const formatDate = (date = new Date()): string => {
  return date.toISOString().split('T')[0];
};

// Simple validation functions
export const isValidAmount = (amount: number | string): boolean => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(numAmount) && numAmount > 0;
};

// Parse amount to number
export const parseAmount = (amount: number | string): number => {
  return typeof amount === 'string' ? parseFloat(amount) : amount;
}; 