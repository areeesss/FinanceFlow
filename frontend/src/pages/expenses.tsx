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

// Define types for the NavItem props
interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  isSidebarOpen: boolean;
}

// Define types for expense data
interface ExpenseItem {
  id: number;
  type: string;
  amount: number;
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
  id: number;
  title: string;
  amount: number;
  color: string;
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

  // Expense data state
  const [ExpenseData, setExpenseData] = useState<ExpenseItem[]>([
    {
      id: 1,
      type: "Rent",
      amount: 1200,
      fill: "hsl(215, 100%, 50%)",
      color: "hsl(215, 100%, 50%)",
    },
    {
      id: 2,
      type: "Savings",
      amount: 3200,
      fill: "hsl(0, 100%, 65%)",
      color: "hsl(0, 100%, 65%)",
    },
    {
      id: 3,
      type: "Transport",
      amount: 115,
      fill: "hsl(135, 75%, 55%)",
      color: "hsl(135, 75%, 55%)",
    },
    {
      id: 4,
      type: "Groceries",
      amount: 450,
      fill: "hsl(270, 70%, 60%)",
      color: "hsl(270, 70%, 60%)",
    },
  ]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Update chart data based on Expense data
  const [chartData, setChartData] = useState<ChartItem[]>([]);

  useEffect(() => {
    // Filter out zero amounts to avoid empty sections in pie chart
    const filteredData = ExpenseData.filter((item) => item.amount > 0);
    setChartData(
      filteredData.map((item) => ({
        name: item.type,
        value: item.amount,
        fill: item.fill,
      }))
    );
  }, [ExpenseData]);

  // Create chart config from Expense data
  const chartConfig: ChartConfig = {
    value: {
      label: "Amount",
      color: "#000000", // Added a default color to satisfy the type
    },
  };

  ExpenseData.forEach((item) => {
    chartConfig[item.type] = {
      label: item.type,
      color: item.fill,
    };
  });

  // Update Expense amount handler
  const updateExpenseAmount = (id: number, newAmount: string) => {
    setExpenseData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, amount: parseFloat(newAmount) || 0 } : item
      )
    );
  };

  // Update Expense type handler
  const updateExpenseType = (id: number, newType: string) => {
    setExpenseData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, type: newType } : item
      )
    );
  };

  // Add new Expense source
  const addExpenseSource = () => {
    // Generate a new color with slight variation
    const hues = [210, 30, 120, 270, 180];
    const newId = ExpenseData.length + 1;
    const hue = hues[newId % hues.length];
    const newColor = `hsl(${hue}, 85%, 60%)`;

    const newSource: ExpenseItem = {
      id: newId,
      type: "New Expense Source",
      amount: 0,
      fill: newColor,
      color: newColor,
    };

    setExpenseData([...ExpenseData, newSource]);

    // Scroll to bottom after adding new Expense source
    scrollToBottom();
  };

  // Delete Expense source
  const deleteExpenseSource = (id: number) => {
    setExpenseData((prevData) => prevData.filter((item) => item.id !== id));
  };

  // Stat card with editable amount and title
  const StatCard = ({ id, title, amount, color }: StatCardProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editAmount, setEditAmount] = useState(amount.toString());
    const [editTitle, setEditTitle] = useState(title);

    const handleSave = () => {
      updateExpenseAmount(id, editAmount);
      updateExpenseType(id, editTitle);
      setIsEditing(false);
    };

    return (
      <Card
        className="p-4 shadow-lg rounded-2xl mb-4 flex items-center"
        style={{ backgroundColor: color }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="ml-4 bottom-0 bg-white text-black hover:text-white px-3 py-1">
              <Menu size={24} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteExpenseSource(id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CardContent className="text-center flex-1 p-4">
          {isEditing ? (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-center">
                <Input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full max-w-xs text-black font-semibold bg-white"
                  placeholder="Income source name"
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
                  onClick={handleSave}
                  className="w-full sm:w-auto bg-white text-black hover:bg-gray-200"
                >
                  <Save size={16} className="mr-2" />
                  <span>Save</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-2">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                {title}
              </h2>
              <p className="text-xl md:text-2xl font-bold text-white mt-2">
                {formatCurrency(amount)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Other state variables
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Removed unused variables: editOpen, setEditOpen
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const [fullName, setFullName] = useState("Test User");
  const [email, setEmail] = useState("test@example.com");
  const [username, setUsername] = useState("TestUser");
  const [isEditing, setIsEditing] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const navigate = useNavigate();

  // Calculate total Expense
  const totalExpense = ExpenseData.reduce((sum, item) => sum + item.amount, 0);

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
          <p className="text-gray-600">
            {((payload[0].value / totalExpense) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }

    return null;
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
                  <CardDescription>
                    Breakdown of your expenses sources (Total:{" "}
                    {formatCurrency(totalExpense)})
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0 flex justify-center">
                  {chartData.length > 0 ? (
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
                            label={({ name, percent }) => {
                              const percentage = (percent * 100).toFixed(0);
                              return isMobile
                                ? `${percentage}%`
                                : `${name}: ${percentage}%`;
                            }}
                            labelLine={!isMobile}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
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
                className="h-[400px] overflow-y-auto space-y-4 p-4 border border-grey shadow-lg bg-white rounded-xl"
                ref={scrollContainerRef} // Add the ref here
              >
                {ExpenseData.map((expense) => (
                  <StatCard
                    key={expense.id}
                    id={expense.id}
                    title={expense.type}
                    amount={expense.amount}
                    color={expense.color}
                  />
                ))}
              </div>
              <Card
                className="mt-4 p-4 shadow-lg rounded-2xl mb-4 border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                onClick={addExpenseSource}
              >
                <CardContent className="flex flex-1 flex-col items-center justify-center text-center">
                  <button className="mt-2 flex flex-col items-center text-gray-500 hover:text-indigo-700">
                    <Plus size={28} />
                    <span className="mt-2 font-medium">
                      Add Expenses Source
                    </span>
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
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
