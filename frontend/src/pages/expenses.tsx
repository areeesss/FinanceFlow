import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
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
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { useExpenses } from "@/hooks";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use our custom expenses hook instead of direct TanStack Query
  const {
    expenses,
    isLoading,
    error,
    totalExpenses,
    formatCurrency,
    createExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses();

  // Transform expenses to match the ExpenseItem interface
  const [expenseData, setExpenseData] = useState<ExpenseItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [fullName, setFullName] = useState("Test User");
  const [email, setEmail] = useState("test@example.com");
  const [username, setUsername] = useState("TestUser");
  const [isEditing, setIsEditing] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [newExpense, setNewExpense] = useState({
    type: "",
    amount: "100",
    color: "#FF0000" // Default red color from image
  });
  
  // Add ref for scroll container
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Process expense data from the custom hook
  useEffect(() => {
    if (expenses && Array.isArray(expenses)) {
      console.log("Expense data from hook:", expenses);
      
      setExpenseData(expenses.map(item => ({
        id: item.id,
        type: item.type || 'Unnamed',
        amount: item.amount, 
        date: item.date || new Date().toISOString(),
        fill: item.color,
        color: item.color
      })));
    }
  }, [expenses]);

  // Save colors to localStorage when they change
  useEffect(() => {
    if (expenseData.length > 0) {
      const colorMap: Record<string, string> = {};
      expenseData.forEach(item => {
        if (item.id && item.color) {
          colorMap[item.id] = item.color;
        }
      });
      localStorage.setItem('expenseColors', JSON.stringify(colorMap));
      console.log("Saved colors to localStorage:", colorMap);
    }
  }, [expenseData]);

  // Update user data from auth context
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setUsername(user.username || "");
    }
  }, [user]);

  // Function to scroll to the bottom of the expense list
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Function to check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Custom tooltip component for the chart
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const value = Number(payload[0].value);
      const percent = totalExpenses > 0 
        ? ((value / totalExpenses) * 100).toFixed(1)
        : '0';
      
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-gray-600">{formatCurrency(value)}</p>
          <p className="text-gray-600">{percent}% of expenses</p>
        </div>
      );
    }
    
    return null;
  };

  // Define the NavItem component
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

  // Function to add a new expense
  const addExpenseSource = async () => {
    if (!newExpense.type || !newExpense.amount) {
      addToast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(newExpense.amount);
    if (isNaN(amount) || amount <= 0) {
      addToast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Prepare the new expense with correct property names
      const newSource = {
        type: newExpense.type,
        amount: amount,
        description: `Expense for ${newExpense.type}`,
        color: newExpense.color
      };
      
      console.log("Creating new expense with color:", newExpense.color);
      const response = await createExpense(newSource);
      
      // Clear the form and close the dialog
      setNewExpense({
        type: "",
        amount: "100",
        color: "#FF0000" // Reset to default color
      });
      setIsDialogOpen(false);
      
      // When creating a new source, we need to wait for the response to get the ID
      if (response && response.data && response.data.id) {
        // Save color to localStorage
        try {
          const colorMap: Record<string, string> = JSON.parse(localStorage.getItem('expenseColors') || '{}');
          colorMap[String(response.data.id)] = newExpense.color;
          localStorage.setItem('expenseColors', JSON.stringify(colorMap));
          console.log("Saved new expense color to localStorage:", {
            id: response.data.id,
            color: newExpense.color
          });
        } catch (e) {
          console.error("Failed to save color to localStorage:", e);
        }
        
        // Scroll to bottom to show new expense
        setTimeout(scrollToBottom, 300);
      }
    } catch (error) {
      // Error is handled by the mutation
      console.error("Error adding expense:", error);
    }
  };

  // Function to update an expense
  const updateExpenseSource = async (id: string, newType: string, newAmount: string, newDate?: string, newColor?: string) => {
    try {
      console.log("updateExpenseSource called with:", { id, newType, newAmount, newDate, newColor });
      
      if (!id) {
        console.error("Cannot update expense with invalid ID:", id);
        addToast({
          title: "Error",
          description: "Cannot update this expense (invalid ID)",
          variant: "destructive",
        });
        return;
      }
      
      if (!newType || !newAmount) {
        addToast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }
      
      const amount = parseFloat(newAmount);
      if (isNaN(amount) || amount <= 0) {
        addToast({
          title: "Error",
          description: "Please enter a valid amount",
          variant: "destructive",
        });
        return;
      }
      
      // Save the new color to localStorage
      if (newColor) {
        try {
          const colorMap: Record<string, string> = JSON.parse(localStorage.getItem('expenseColors') || '{}');
          colorMap[String(id)] = newColor;
          localStorage.setItem('expenseColors', JSON.stringify(colorMap));
          console.log("Saved card color to localStorage:", {id, color: newColor});
        } catch (e) {
          console.error("Failed to save color to localStorage:", e);
        }
      }
      
      // Prepare data to update with correct property names
      const updatedSource = {
        type: newType,
        amount: amount,
        date: newDate || new Date().toISOString(),
        color: newColor
      };
      
      await updateExpense(id, updatedSource);
      
    } catch (error) {
      console.error("Error updating expense source:", error);
      addToast({
        title: "Error",
        description: "Failed to update expense source",
        variant: "destructive",
      });
    }
  };

  // Function to delete an expense
  const deleteExpenseSource = async (id: string) => {
    try {
      if (!id) {
        console.error("Cannot delete expense with invalid ID:", id);
        addToast({
          title: "Error",
          description: "Cannot delete this expense (invalid ID)",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Deleting expense with ID:", id);
      
      // Remove from localStorage when deleted
      try {
        const colorMap: Record<string, string> = JSON.parse(localStorage.getItem('expenseColors') || '{}');
        if (colorMap[String(id)]) {
          delete colorMap[String(id)];
          localStorage.setItem('expenseColors', JSON.stringify(colorMap));
          console.log("Removed color from localStorage for deleted expense:", id);
        }
      } catch (e) {
        console.error("Failed to update localStorage on delete:", e);
      }
      
      await deleteExpense(id);
    } catch (error) {
      console.error("Error deleting expense:", error);
      addToast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  // Helper function to format dates better
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid Date";
    }
  };

  // Define the StatCard component for editable expense sources
  const StatCard = ({ id, title, amount, color, date }: StatCardProps) => {
    const [isEditingCard, setIsEditingCard] = useState(false);
    const [editAmount, setEditAmount] = useState(amount.toString());
    const [editTitle, setEditTitle] = useState(title);
    const [editDate, setEditDate] = useState(date || new Date().toISOString());
    const [editColor, setEditColor] = useState(color);
    
    const [quickAddAmount, setQuickAddAmount] = useState('');
    const [isQuickEditing, setIsQuickEditing] = useState(false);

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

    // Function to call handleDelete with the proper ID
    const onDeleteClick = () => {
      console.log("Attempting to delete expense with ID:", id);
      
      // First check if ID is valid
      if (!id) {
        console.error("Cannot delete expense with invalid ID:", id);
        addToast({
          title: "Error",
          description: "Cannot delete this expense source (invalid ID)",
          variant: "destructive",
        });
        return;
      }
      
      // Call the delete function directly
      deleteExpenseSource(id);
    };

    return (
      <Card
        id={`expense-card-${id}`}
        className="p-4 shadow-lg rounded-2xl mb-3 flex items-center w-full relative"
        style={{ backgroundColor: isEditingCard ? editColor : color }}
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
                    onClick={() => setIsLogoutDialogOpen(true)}
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
          <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
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
                  onClick={() => setIsLogoutDialogOpen(false)}
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
                    <span>Breakdown of your expenses sources (Total: {formatCurrency(expenseData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0))})</span>
                    <Button
                      onClick={() => setIsDialogOpen(true)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Expense
                    </Button>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0 flex justify-center h-[320px]">
                  {isLoading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : error ? (
                    <div className="text-center text-red-500">
                      <p>{error.message}</p>
                      <Button onClick={() => window.location.reload()} className="mt-4">
                        Retry
                      </Button>
                    </div>
                  ) : expenseData.length > 0 ? (
                    <div className="mx-auto w-full max-w-[500px] h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenseData}
                            dataKey="amount"
                            nameKey="type"
                            cx="50%"
                            cy="50%"
                            outerRadius={isMobile ? 80 : 120}
                            innerRadius={0}
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={-270}
                            label={({ name, amount }) => {
                              const percentage = ((amount / expenseData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)) * 100).toFixed(0);
                              return isMobile
                                ? `${percentage}%`
                                : `${name}: ${percentage}%`;
                            }}
                            labelLine={!isMobile}
                          >
                            {expenseData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
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
                        onClick={() => setIsDialogOpen(true)}
                      >
                        Add Expense
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
                ref={scrollContainerRef}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center w-full h-full min-h-[320px]">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : expenseData.length > 0 ? (
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
                      onClick={() => setIsDialogOpen(true)}
                    >
                      Add Expense
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
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center">
                        <div className="flex justify-center items-center h-[100px] w-full">
                          <LoadingSpinner size="md" />
                        </div>
                      </td>
                    </tr>
                  ) : expenseData.length > 0 ? (
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

      {/* Add Expense Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Add a new expense to track your spending
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={newExpense.type}
                onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                placeholder="e.g., Groceries, Rent, Transportation"
                className="text-black font-medium"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                placeholder="Enter amount"
                className="text-black font-medium"
              />
            </div>
            
            {/* Color Picker with preview */}
            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <div className="p-2 rounded-md" style={{ backgroundColor: newExpense.color }}>
                <div className="bg-white p-3 rounded-lg shadow-inner border">
                  <div className="grid grid-cols-9 gap-2">
                    {COLOR_OPTIONS.slice(0, 9).map((colorOption, index) => (
                      <button
                        key={index}
                        className={`w-6 h-6 rounded-full ${
                          newExpense.color === colorOption 
                            ? 'ring-2 ring-offset-1 ring-black' 
                            : ''
                        }`}
                        style={{ backgroundColor: colorOption }}
                        onClick={() => setNewExpense({ ...newExpense, color: colorOption })}
                        type="button"
                        aria-label={`Color option ${index + 1}`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-9 gap-2 mt-2">
                    {COLOR_OPTIONS.slice(9, 18).map((colorOption, index) => (
                      <button
                        key={index + 9}
                        className={`w-6 h-6 rounded-full ${
                          newExpense.color === colorOption 
                            ? 'ring-2 ring-offset-1 ring-black' 
                            : ''
                        }`}
                        style={{ backgroundColor: colorOption }}
                        onClick={() => setNewExpense({ ...newExpense, color: colorOption })}
                        type="button"
                        aria-label={`Color option ${index + 10}`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-9 gap-2 mt-2">
                    {COLOR_OPTIONS.slice(18, 27).map((colorOption, index) => (
                      <button
                        key={index + 18}
                        className={`w-6 h-6 rounded-full ${
                          newExpense.color === colorOption 
                            ? 'ring-2 ring-offset-1 ring-black' 
                            : ''
                        }`}
                        style={{ backgroundColor: colorOption }}
                        onClick={() => setNewExpense({ ...newExpense, color: colorOption })}
                        type="button"
                        aria-label={`Color option ${index + 19}`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-9 gap-2 mt-2">
                    {COLOR_OPTIONS.slice(27, 36).map((colorOption, index) => (
                      <button
                        key={index + 27}
                        className={`w-6 h-6 rounded-full ${
                          newExpense.color === colorOption 
                            ? 'ring-2 ring-offset-1 ring-black' 
                            : ''
                        }`}
                        style={{ backgroundColor: colorOption }}
                        onClick={() => setNewExpense({ ...newExpense, color: colorOption })}
                        type="button"
                        aria-label={`Color option ${index + 28}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDialogOpen(false);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-black"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={addExpenseSource}
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              Add
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Expenses;
