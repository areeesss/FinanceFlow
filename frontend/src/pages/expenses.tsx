import { useState, useEffect, useRef, useMemo } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Wallet,
  Goal,
  List,
  CreditCard,
  Menu,
  Settings,
  Save,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import darkfont from "@/assets/imgs/darkfont.webp";
import userimg from "@/assets/imgs/user.webp";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Pie, PieChart, Tooltip, Cell, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFinance } from "@/context/FinanceContext";
import { expenseService } from "@/services/api";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

// Define a set of consistent colors for expense sources
const EXPENSE_COLORS = [
  "#F56565", // Red
  "#ED8936", // Orange
  "#DD6B20", // Dark Orange
  "#9F7AEA", // Purple
  "#805AD5", // Purple
  "#D53F8C", // Pink
  "#4299E1", // Blue
  "#3182CE", // Blue
  "#38B2AC", // Teal
  "#48BB78", // Green
  "#38A169", // Green
  "#667EEA", // Indigo
];

// Add color options array near the top of the file with the other constants
const COLOR_OPTIONS = [
  // Row 1
  "#000000", "#FF0000", "#FF8C00", "#FFFF00", "#00FF00", "#0000FF", "#FF00FF", "#CD853F", "#00FFFF",
  // Row 2
  "#696969", "#DC143C", "#DEB887", "#F0E68C", "#32CD32", "#483D8B", "#DA70D6", "#A0522D", "#20B2AA",
  // Row 3
  "#A9A9A9", "#B22222", "#CD7F32", "#EEE8AA", "#228B22", "#191970", "#9932CC", "#8B4513", "#008B8B",
  // Row 4
  "#D3D3D3", "#8B0000", "#B8860B", "#F5F5DC", "#006400", "#000080", "#800080", "#A52A2A", "#008080"
];

// Define types for the NavItem props
interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  isSidebarOpen: boolean;
}

// Define types for expense data
interface ExpenseItem {
  id: string;
  type: string;
  amount: number;
  date?: string;
  fill: string;
  color: string;
}

// Define types for chart data
interface ChartItem {
  name: string;
  value: number;
  fill: string;
}

// Define types for chart config
interface ChartConfig {
  value: {
    label: string;
    color: string; // Added color property to match the index signature
  };
  [key: string]: {
    label: string;
    color: string;
  };
}

// Define types for StatCard props
interface StatCardProps {
  id: string;
  title: string;
  amount: number;
  color: string;
  date?: string;
}

// Define type for the tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: any;
  }>;
}

const Expenses = () => {
  const { addToast } = useToast();
  const { expenses, loading, error, refreshData } = useFinance();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expenseData, setExpenseData] = useState<ExpenseItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [fullName, setFullName] = useState("Test User");
  const [email, setEmail] = useState("test@example.com");
  const [username, setUsername] = useState("TestUser");
  const [isEditing, setIsEditing] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Add ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop =
            scrollContainerRef.current.scrollHeight;
        }
      }, 100); // Small delay to ensure DOM updates
    }
  };
  
  // Process expense data from the backend with saved colors
  useEffect(() => {
    if (expenses && Array.isArray(expenses)) {
      console.log("Expense data from backend:", expenses);
      if (expenses.length > 0) {
        console.log("First expense item:", expenses[0]);
        console.log("ID properties:", {
          _id: expenses[0]._id,
          id: expenses[0].id,
          typeOfId: typeof expenses[0]._id || typeof expenses[0].id
        });
        console.log("Expense color information:", {
          color: expenses[0].color,
          typeOfColor: typeof expenses[0].color
        });
      }
      
      // Load saved colors from localStorage
      let savedColors: Record<string, string> = {};
      try {
        savedColors = JSON.parse(localStorage.getItem('expenseColors') || '{}');
        console.log("Loaded colors from localStorage:", savedColors);
      } catch (e) {
        console.error("Failed to parse saved colors:", e);
      }
      
      setExpenseData(expenses.map((item, index) => {
        // Ensure we have an ID - use _id (MongoDB) or id (regular), or fallback to index
        const itemId = item._id || item.id || `temp-${index}`;
        console.log(`Item #${index} ID:`, itemId, "Type:", typeof itemId);
        
        // Use deterministic color based on type to ensure consistency
        const typeHash = item.type ? 
          item.type.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) : 0;
        const colorIndex = typeHash % EXPENSE_COLORS.length;
        
        // First try to get color from localStorage, fallback to default colors
        const itemColor = savedColors[String(itemId)] || EXPENSE_COLORS[colorIndex];
        console.log(`Color for item ${index}:`, itemColor);
        
        return {
          id: itemId,
          // Use name if available, fall back to type, or provide a default if both are missing
          type: item.name || item.type || 'Misc Expense', 
          amount: Number(item.amount) || 0,
          date: item.date || new Date().toISOString(),
          fill: itemColor,
          color: itemColor,
        };
      }));
    }
  }, [expenses]);

  // Calculate total expense and ensure it's not NaN
  const totalExpense = expenseData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Prepare chart data with better filtering using useMemo
  const chartData = useMemo(() => {
    const chartItems = expenseData
      .filter(item => Number(item.amount) > 0) 
      .map(item => ({
        name: item.type || 'Unnamed',
        value: Number(item.amount),
        fill: item.color || item.fill,
      }));
    
    console.log("Chart data with colors:", chartItems);
    return chartItems;
  }, [expenseData]);
  
  // Check for mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Custom tooltip component with proper formatting
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const value = Number(payload[0].value);
      const percent = totalExpense > 0 
        ? ((value / totalExpense) * 100).toFixed(1)
        : '0';
      
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{formatCurrency(value)}</p>
          <p className="text-gray-600">
            {percent}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const NavItem = ({
    icon: Icon,
    label,
    active,
    isSidebarOpen,
  }: NavItemProps) => (
    <div
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
        active ? "text-indigo-900 font-medium" : "text-gray-400"
      } hover:text-indigo-900 hover:font-medium`}
    >
      {active && (
        <div className="absolute left-0 top-0 h-full w-1 bg-indigo-900 rounded-r-md" />
      )}
      <Icon
        size={24}
        className={`transition-all duration-200 ${
          active ? "text-indigo-900" : "text-gray-400"
        } group-hover:text-indigo-900`}
      />
      {isSidebarOpen && (
        <span className="transition-opacity duration-200 opacity-100 group-hover:opacity-100">
          {label}
        </span>
      )}
    </div>
  );

  // Handle adding a new expense with a default amount of 100
  const addExpenseSource = async () => {
    try {
      // Define a list of expense source types with appropriate colors
      const expenseTypes = [
        { type: "Groceries", color: "#EF4444", description: "Food and household items", amount: 100 }, // Red
        { type: "Housing", color: "#F59E0B", description: "Rent, mortgage, and utilities", amount: 100 }, // Yellow
        { type: "Transportation", color: "#10B981", description: "Car, public transit, and fuel", amount: 100 }, // Green
        { type: "Entertainment", color: "#8B5CF6", description: "Movies, games, and events", amount: 100 }, // Purple
        { type: "Healthcare", color: "#3B82F6", description: "Medical expenses and insurance", amount: 100 }, // Blue
      ];
      
      // Get existing expense types
      const existingTypes = expenseData.map(item => item.type);
      
      // Find a type that doesn't exist yet, or default to "Other Expense"
      let newSource = expenseTypes.find(item => !existingTypes.includes(item.type));
      
      // If all pre-defined types are used, create one with a random name
      if (!newSource) {
        const randomIndex = Math.floor(Math.random() * expenseTypes.length);
        const baseType = expenseTypes[randomIndex];
        newSource = {
          type: `Other Expense ${existingTypes.length + 1}`,
          color: baseType.color,
          description: "Additional expense category",
          amount: 100
        };
      }
      
      // Add today's date to the new source
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      // Use type assertion to add the date property
      const sourceWithDate = {
        ...newSource,
        date: formattedDate,
        name: newSource.type // Ensure name is set equal to type
      };

      console.log("Quick adding expense source with color:", newSource.color);
      // Remove the color from what we send to the backend
      const { color, ...backendData } = sourceWithDate;
      const response = await expenseService.create(backendData);
      
      // When creating a new source, we need to wait for the response to get the ID
      if (response && response.data && response.data.id) {
        // Save color to localStorage
        try {
          const colorMap: Record<string, string> = JSON.parse(localStorage.getItem('expenseColors') || '{}');
          colorMap[String(response.data.id)] = newSource.color;
          localStorage.setItem('expenseColors', JSON.stringify(colorMap));
          console.log("Saved new expense source color to localStorage:", {
            id: response.data.id,
            color: newSource.color
          });
        } catch (e) {
          console.error("Failed to save color to localStorage:", e);
        }
      }
      
      await refreshData();
      scrollToBottom();
      
      addToast({
        title: "Success",
        description: `New expense source added. Edit it to update details.`,
      });
    } catch (error) {
      console.error("Error adding expense source:", error);
      addToast({
        title: "Error",
        description: "Failed to add expense source",
        variant: "destructive",
      });
    }
  };

  // Update expense source and refresh chart data
  const updateExpenseSource = async (id: string, newType: string, newAmount: string, newDate?: string, newColor?: string) => {
    try {
      console.log("Updating expense source with ID:", id, "Type:", typeof id);
      console.log("Color being updated to:", newColor);
      
      if (!id) {
        console.error("Cannot update expense with invalid ID:", id);
        addToast({
          title: "Error",
          description: "Cannot update this expense source (invalid ID)",
          variant: "destructive",
        });
        return;
      }
      
      const amount = parseFloat(newAmount);
      if (isNaN(amount) || amount < 0) {
        addToast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }

      // Save color to localStorage
      if (newColor) {
        try {
          const colorMap: Record<string, string> = JSON.parse(localStorage.getItem('expenseColors') || '{}');
          colorMap[String(id)] = newColor;
          localStorage.setItem('expenseColors', JSON.stringify(colorMap));
          console.log("Saved color to localStorage:", {id, color: newColor});
        } catch (e) {
          console.error("Failed to save color to localStorage:", e);
        }
      }

      // Both name and type should be updated to the new value
      const updatedSource = {
        type: newType,
        amount: amount,
        name: newType, // Setting name equal to type for consistency
        description: `Expense for ${newType}`,
        date: newDate || new Date().toISOString().split('T')[0]
        // Note: We don't send color to backend since it doesn't support it
      };

      console.log("Sending update with data:", updatedSource);
      await expenseService.update(id, updatedSource);
      
      addToast({
        title: "Success",
        description: "Expense source updated successfully",
      });
      
      refreshData();
    } catch (error) {
      console.error("Error updating expense source:", error);
      addToast({
        title: "Error",
        description: "Failed to update expense source",
        variant: "destructive",
      });
    }
  };

  // Delete expense source with confirmation
  const deleteExpenseSource = async (id: string) => {
    try {
      console.log("Deleting expense with ID:", id, "Type:", typeof id);
      
      if (!id) {
        console.error("Cannot delete expense with invalid ID:", id);
        addToast({
          title: "Error",
          description: "Cannot delete this expense source (invalid ID)",
          variant: "destructive",
        });
        return;
      }
      
      // Remove from localStorage when deleted
      try {
        const colorMap: Record<string, string> = JSON.parse(localStorage.getItem('expenseColors') || '{}');
        if (colorMap[String(id)]) {
          delete colorMap[String(id)];
          localStorage.setItem('expenseColors', JSON.stringify(colorMap));
          console.log("Removed color from localStorage for deleted expense source:", id);
        }
      } catch (e) {
        console.error("Failed to update localStorage on delete:", e);
      }
      
      await expenseService.delete(id);
      
      addToast({
        title: "Success",
        description: "Expense source deleted successfully",
      });
      
      refreshData();
    } catch (error) {
      console.error("Error deleting expense source:", error);
      addToast({
        title: "Error",
        description: "Failed to delete expense source",
        variant: "destructive",
      });
    }
  };

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Stat card with editable amount and title
  const StatCard = ({ id, title, amount, color, date }: StatCardProps) => {
    const [isEditingCard, setIsEditingCard] = useState(false);
    const [editAmount, setEditAmount] = useState(amount.toString());
    const [editTitle, setEditTitle] = useState(title);
    const [editDate, setEditDate] = useState(date || new Date().toISOString().split('T')[0]);
    const [editColor, setEditColor] = useState(color);
    const [isQuickEditing, setIsQuickEditing] = useState(false);
    const [quickAddAmount, setQuickAddAmount] = useState('');

    console.log("StatCard rendering with ID:", id, "Type:", typeof id, "Title:", title, "Color:", color);

    const handleSaveCard = () => {
      console.log("Saving card with new color:", editColor);
      updateExpenseSource(id, editTitle, editAmount, editDate, editColor);
      setIsEditingCard(false);
    };

    const handleQuickAdd = () => {
      const addAmount = parseFloat(quickAddAmount);
      if (isNaN(addAmount) || addAmount <= 0) {
        addToast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }
      
      const newAmount = amount + addAmount;
      updateExpenseSource(id, title, newAmount.toString(), date, color);
      setIsQuickEditing(false);
      setQuickAddAmount('');
    };

    // Function to safely delete with ID
    const onDeleteClick = () => {
      console.log("Attempting to delete expense with ID:", id, "Type:", typeof id);
      deleteExpenseSource(id);
    };

    return (
      <Card
        id={`expense-card-${id}`}
        className="p-4 shadow-lg rounded-2xl mb-3 flex items-center w-full relative"
        style={{ backgroundColor: color }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="ml-2 bottom-0 bg-white text-black hover:text-white px-3 py-1">
              <Menu size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setIsEditingCard(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteClick}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Edit Button */}
        {!isEditingCard && !isQuickEditing && (
          <Button 
            onClick={() => setIsQuickEditing(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-1 h-8 w-8 rounded-full"
          >
            <Plus size={16} />
          </Button>
        )}

        <CardContent className="text-center flex-1 p-3">
          {isEditingCard ? (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-center">
                <Input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full max-w-xs text-black font-semibold bg-white"
                  placeholder="Expense source name"
                />
              </div>
              <div className="flex items-center justify-center">
                <Input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full max-w-xs text-black bg-white"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full max-w-xs sm:w-32 text-black bg-white"
                />
                <Button
                  onClick={handleSaveCard}
                  className="w-full sm:w-auto bg-white text-black hover:bg-gray-200"
                >
                  <Save size={14} className="mr-2" />
                  <span>Save</span>
                </Button>
              </div>
              
              {/* Color Picker within the edit form */}
              <div className="bg-white p-3 rounded-lg shadow-inner">
                <label className="text-sm text-gray-700 block mb-2">Select Color</label>
                <div className="grid grid-cols-9 gap-2">
                  {COLOR_OPTIONS.slice(0, 9).map((colorOption, index) => (
                    <button
                      key={index}
                      className={`w-6 h-6 rounded-full ${editColor === colorOption ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                      style={{ backgroundColor: colorOption }}
                      onClick={() => setEditColor(colorOption)}
                      type="button"
                      aria-label={`Color option ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-9 gap-2 mt-2">
                  {COLOR_OPTIONS.slice(9, 18).map((colorOption, index) => (
                    <button
                      key={index + 9}
                      className={`w-6 h-6 rounded-full ${editColor === colorOption ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                      style={{ backgroundColor: colorOption }}
                      onClick={() => setEditColor(colorOption)}
                      type="button"
                      aria-label={`Color option ${index + 10}`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-9 gap-2 mt-2">
                  {COLOR_OPTIONS.slice(18, 27).map((colorOption, index) => (
                    <button
                      key={index + 18}
                      className={`w-6 h-6 rounded-full ${editColor === colorOption ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                      style={{ backgroundColor: colorOption }}
                      onClick={() => setEditColor(colorOption)}
                      type="button"
                      aria-label={`Color option ${index + 19}`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-9 gap-2 mt-2">
                  {COLOR_OPTIONS.slice(27, 36).map((colorOption, index) => (
                    <button
                      key={index + 27}
                      className={`w-6 h-6 rounded-full ${editColor === colorOption ? 'ring-2 ring-offset-1 ring-black' : ''}`}
                      style={{ backgroundColor: colorOption }}
                      onClick={() => setEditColor(colorOption)}
                      type="button"
                      aria-label={`Color option ${index + 28}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-1 w-full">
              <h2 className="text-md md:text-lg font-semibold text-white">
                {title}
              </h2>
              <p className="text-xs text-white opacity-80 mb-1">
                {formatDate(date)}
              </p>
              <p className="text-lg md:text-xl font-bold text-white">
                {formatCurrency(amount)}
              </p>
            </div>
          )}
        </CardContent>

        {/* Quick Add Popup */}
        {isQuickEditing && !isEditingCard && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            <Card className="shadow-lg p-2 bg-white border border-gray-200">
              <CardContent className="p-2">
                <p className="text-sm font-medium mb-2 text-gray-700">Add Amount</p>
                <div className="flex flex-col gap-2">
                  <Input
                    type="number"
                    value={quickAddAmount}
                    onChange={(e) => setQuickAddAmount(e.target.value)}
                    className="w-32 text-black bg-white"
                    placeholder="Enter amount"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleQuickAdd}
                      className="bg-green-500 hover:bg-green-600 text-white flex-1"
                      size="sm"
                    >
                      Add
                    </Button>
                    <Button
                      onClick={() => {
                        setIsQuickEditing(false);
                        setQuickAddAmount('');
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-black"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
        </CardContent>
            </Card>
          </div>
        )}
      </Card>
    );
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-indigo-100 overflow-hidden">
      {/* CSS Variables for chart colors */}
      <style>{`
        :root {
          --chart-1: 215, 100%, 50%; /* Blue for Expense */
          --chart-2: 0, 100%, 65%; /* Red for Expenses */
          --chart-3: 135, 75%, 55%; /* Green for Savings */
          --chart-4: 270, 70%, 60%; /* Purple */
          --chart-5: 45, 100%, 60%; /* Yellow */

          /* Card background classes */
          .bg-Expense {
            background-color: hsl(215, 100%, 50%);
          }
          .bg-expenses {
            background-color: hsl(0, 100%, 65%);
          }
          .bg-savings {
            background-color: hsl(135, 75%, 55%);
          }
        }
      `}</style>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-0 z-50 h-screen bg-white shadow-md p-4 transition-all duration-300 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:w-48 md:flex-shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16">
          <img
            src={darkfont}
            alt="Logo"
            className="w-32 transition-all duration-300"
          />
          <button onClick={toggleSidebar} className="p-2 rounded-md md:hidden">
            <Menu size={24} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="mt-6 space-y-2">
          <Link to="/dashboard">
            <NavItem icon={Home} label="Dashboard" isSidebarOpen={true} />
          </Link>
          <Link to="/income">
            <NavItem icon={Wallet} label="Income" isSidebarOpen={true} />
          </Link>
          <Link to="/expenses">
            <NavItem
              icon={CreditCard}
              label="Expenses"
              active
              isSidebarOpen={true}
            />
          </Link>
          <Link to="/financegoal">
            <NavItem icon={Goal} label="Goals" isSidebarOpen={true} />
          </Link>

          <Link to="/budgets">
            <NavItem icon={List} label="Budgets" isSidebarOpen={true} />
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm z-30 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Menu toggle button - only visible on mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="md:hidden"
              >
                <Menu size={24} />
              </Button>
              <h1 className="text-base sm:text-lg md:text-xl font-bold">
                Expenses
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/aboutus">
                <button className="text-base sm:text-lg md:text-xl font-bold text-black hover:underline">
                  About Us
                </button>
              </Link>
              {/* Avatar with Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <img
                      src={userimg}
                      alt="User"
                      className="h-full w-full object-cover rounded-full"
                    />
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-white shadow-lg rounded-md"
                >
                  {/* ✅ Clicking View Profile opens the popover but doesn't close it when moving mouse */}
                  <Popover
                    open={openPopover}
                    onOpenChange={setOpenPopover}
                    modal={true}
                  >
                    <PopoverTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()} // Prevents dropdown from closing
                        onClick={() => setOpenPopover(true)}
                      >
                        View Profile
                      </DropdownMenuItem>
                    </PopoverTrigger>
                    <PopoverContent
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "center" : "start"}
                      className="w-[60vw] max-w-xs sm:max-w-sm md:w-80 p-3 sm:p-4 bg-white shadow-lg rounded-md"
                      sideOffset={isMobile ? 5 : 10}
                    >
                      {/* Personal Information */}
                      <h2 className="text-lg sm:text-xl font-semibold">
                        Personal Information
                      </h2>
                      <div className="relative mt-2 p-3 sm:p-4 pb-2 rounded-lg border bg-gray-100">
                        {/* Toggle button - with more space below content */}
                        <button
                          className="absolute bottom-2 right-2 text-gray-600 hover:text-gray-800"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          {isEditing ? (
                            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
                          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0">
                            <img
                              src={userimg}
                              alt="User"
                              className="h-full w-full object-cover rounded-full"
                            />
                          </Avatar>

                          <div className="w-full overflow-hidden">
                            {isEditing ? (
                              <div className="flex flex-col space-y-2 mb-6">
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-sm sm:text-base border rounded-md"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                  placeholder="Full Name"
                                />
                                <input
                                  type="email"
                                  className="w-full px-2 py-1 text-sm sm:text-base border rounded-md"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="Email"
                                />
                                <input
                                  type="text"
                                  className="w-full px-2 py-1 text-sm sm:text-base border rounded-md"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value)}
                                  placeholder="Username"
                                />
                              </div>
                            ) : (
                              <div className="overflow-hidden">
                                <p className="text-base sm:text-lg font-bold truncate">
                                  {fullName}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                  {email}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                  Username: {username}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notification Settings */}
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg border bg-gray-100 flex justify-between items-center">
                        <div className="flex-1 pr-2">
                          <h3 className="text-sm sm:text-md font-semibold">
                            Notification Settings
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Manage how you receive alerts
                          </p>
                        </div>
                        <Switch
                          checked={notificationsEnabled}
                          onCheckedChange={setNotificationsEnabled}
                        />
                      </div>

                      {/* Email Notifications */}
                      <div className="mt-2 p-3 sm:p-4 rounded-lg border bg-gray-100 flex justify-between items-center">
                        <div className="flex-1 pr-2">
                          <h3 className="text-sm sm:text-md font-semibold">
                            Email Notifications
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Weekly summaries and alerts
                          </p>
                        </div>
                        <Switch
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Logout Confirmation Dialog */}
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will log you out of your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="bg-indigo-100 hover:bg-indigo-300"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-indigo-100 hover:bg-indigo-300 text-black"
                  onClick={() => navigate("/login")}
                >
                  Log Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Chart and Stats Container - Side by Side Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Pie Chart - Takes 2/3 of the space on desktop */}
            <div className="md:col-span-2">
              <Card className="min-h-[400px]">
                <CardHeader>
                  <CardTitle>Expenses Overview</CardTitle>
                  <CardDescription className="flex justify-between items-center">
                    <span>Breakdown of your expenses sources (Total: {formatCurrency(totalExpense)})</span>
                    <Button
                      onClick={addExpenseSource}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Expense
                    </Button>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0 flex justify-center">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <LoadingSpinner />
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-500">
                      <p>{error}</p>
                      <Button onClick={refreshData} className="mt-4">
                        Retry
                      </Button>
                    </div>
                  ) : chartData.length > 0 ? (
                    <div className="mx-auto w-full max-w-[500px] h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={isMobile ? 80 : 120}
                            innerRadius={0}
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={-270}
                            label={({ name, percent }) => {
                              const percentage = (percent * 100).toFixed(0);
                              return isMobile
                                ? `${percentage}%`
                                : `${name}: ${percentage}%`;
                            }}
                            labelLine={!isMobile}
                          >
                            {chartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.fill}
                                stroke="#ffffff"
                                strokeWidth={1}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64">
                      <p className="text-gray-500 mb-4">
                        No expenses data to display
                      </p>
                      <Button
                        className="bg-indigo-500 hover:bg-indigo-600 text-white"
                        onClick={addExpenseSource}
                      >
                        Add Expense Source
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards - Stacked vertically, takes 1/3 of the space on desktop */}
            <div className="md:col-span-1 flex flex-col justify-between">
              <div
                className="h-[428px] overflow-y-auto space-y-3 p-3 border border-grey shadow-lg bg-white rounded-xl"
                ref={scrollContainerRef} // Add the ref here
              >
                {expenseData.length > 0 ? (
                  expenseData.map((expense) => (
                  <StatCard
                    key={expense.id}
                    id={expense.id}
                    title={expense.type}
                    amount={expense.amount}
                    color={expense.color}
                      date={expense.date}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <p className="mb-4">No expense sources found</p>
                    <Button
                      className="bg-indigo-500 hover:bg-indigo-600 text-white"
                onClick={addExpenseSource}
              >
                      Add Expense Source
                    </Button>
            </div>
                )}
          </div>
            </div>
          </div>

          {/* Transaction History Table */}
          <Card className="rounded-xl border bg-card text-card-foreground shadow mt-6">
            <CardHeader>
              <CardTitle>Expense History</CardTitle>
              <CardDescription>Your recent expense transactions</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-gray-600" style={{width: "30%"}}>Date</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600" style={{width: "40%"}}>Category</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600" style={{width: "30%"}}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseData.length > 0 ? (
                    expenseData.map((expense) => (
                      <tr key={expense.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{formatDate(expense.date)}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center">
                            <span 
                              className="w-3 h-3 rounded-full mr-2 inline-block" 
                              style={{ backgroundColor: expense.color }}
                            ></span>
                            {expense.type}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 font-medium">
                          {formatCurrency(expense.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-center text-gray-500">
                        No expense transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Expenses;
