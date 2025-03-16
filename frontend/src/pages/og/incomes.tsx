import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";
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

const Income = () => {
  const NavItem = ({ icon: Icon, label, active, isSidebarOpen }) => (
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
  const scrollContainerRef = useRef(null);

  // Function to scroll to bottom
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop =
          scrollContainerRef.current.scrollHeight;
      }, 100); // Small delay to ensure DOM updates
    }
  };

  // Income data state
  const [incomeData, setIncomeData] = useState([
    {
      id: 1,
      type: "Pay Check",
      amount: 5000,
      fill: "hsl(215, 100%, 50%)",
      color: "hsl(215, 100%, 50%)",
    },
    {
      id: 2,
      type: "Business",
      amount: 3000,
      fill: "hsl(0, 100%, 65%)",
      color: "hsl(0, 100%, 65%)",
    },
    {
      id: 3,
      type: "Side Hustle",
      amount: 1000,
      fill: "hsl(135, 75%, 55%)",
      color: "hsl(135, 75%, 55%)",
    },
  ]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Update chart data based on income data
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Filter out zero amounts to avoid empty sections in pie chart
    const filteredData = incomeData.filter((item) => item.amount > 0);
    setChartData(
      filteredData.map((item) => ({
        name: item.type,
        value: item.amount,
        fill: item.fill,
      }))
    );
  }, [incomeData]);

  // Create chart config from income data
  const chartConfig = {
    value: {
      label: "Amount",
    },
  };

  incomeData.forEach((item) => {
    chartConfig[item.type] = {
      label: item.type,
      color: item.fill,
    };
  });

  // Update income amount handler
  const updateIncomeAmount = (id, newAmount) => {
    setIncomeData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, amount: parseFloat(newAmount) || 0 } : item
      )
    );
  };

  // Update income type handler
  const updateIncomeType = (id, newType) => {
    setIncomeData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, type: newType } : item
      )
    );
  };

  // Add new income source
  const addIncomeSource = () => {
    // Generate a new color with slight variation
    const hues = [210, 30, 120, 270, 180];
    const newId = incomeData.length + 1;
    const hue = hues[newId % hues.length];
    const newColor = `hsl(${hue}, 85%, 60%)`;

    const newSource = {
      id: newId,
      type: "New Income Source",
      amount: 0,
      fill: newColor,
      color: newColor,
    };

    setIncomeData([...incomeData, newSource]);

    // Scroll to bottom after adding new income source
    scrollToBottom();
  };

  // Delete income source
  const deleteIncomeSource = (id) => {
    setIncomeData((prevData) => prevData.filter((item) => item.id !== id));
  };

  // Stat card with editable amount and title
  const StatCard = ({ id, title, amount, color }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editAmount, setEditAmount] = useState(amount.toString());
    const [editTitle, setEditTitle] = useState(title);

    const handleSave = () => {
      updateIncomeAmount(id, editAmount);
      updateIncomeType(id, editTitle);
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
            <DropdownMenuItem onClick={() => deleteIncomeSource(id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CardContent className="text-center flex-1">
          {isEditing ? (
            <>
              <div className="flex items-center justify-center mt-2">
                <Input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-54 mb-2 text-black font-semibold bg-white"
                  placeholder="Income source name"
                />
              </div>
              <div className="flex items-center justify-center mt-2">
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-32 mr-2 text-black bg-white"
                />
                <Button
                  onClick={handleSave}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <Save size={16} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(amount)}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // Other state variables
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    console.log("User logged out");
    // Add actual logout logic here
  };

  const [fullName, setFullName] = useState("Test User");
  const [email, setEmail] = useState("test@example.com");
  const [username, setUsername] = useState("TestUser");
  const [isEditing, setIsEditing] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Calculate total income
  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-semibold">{payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)}</p>
          <p className="text-gray-600">
            {((payload[0].value / totalIncome) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex h-screen bg-indigo-100 overflow-hidden">
      {/* CSS Variables for chart colors */}
      <style jsx>{`
        :root {
          --chart-1: 215, 100%, 50%; /* Blue for Income */
          --chart-2: 0, 100%, 65%; /* Red for Expenses */
          --chart-3: 135, 75%, 55%; /* Green for Savings */
          --chart-4: 270, 70%, 60%; /* Purple */
          --chart-5: 45, 100%, 60%; /* Yellow */

          /* Card background classes */
          .bg-income {
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
          <NavItem icon={Home} label="Dashboard" isSidebarOpen={true} />
          <NavItem icon={Wallet} label="Income" active isSidebarOpen={true} />
          <NavItem icon={CreditCard} label="Expenses" isSidebarOpen={true} />
          <NavItem icon={Goal} label="Goals" isSidebarOpen={true} />
          <NavItem icon={List} label="Budgets" isSidebarOpen={true} />
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
                Income Overview
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="text-base sm:text-lg md:text-xl font-bold text-black hover:underline">
                About Us
              </button>

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
                  <Popover
                    open={openPopover}
                    onOpenChange={setOpenPopover}
                    modal={true}
                  >
                    <PopoverTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        onClick={() => setOpenPopover(true)}
                      >
                        View Profile
                      </DropdownMenuItem>
                    </PopoverTrigger>
                    <PopoverContent
                      side="right"
                      align="start"
                      className="w-80 p-4 bg-white shadow-lg rounded-md"
                    >
                      {/* Personal Information */}
                      <h2 className="text-xl font-semibold">
                        Personal Information
                      </h2>
                      <div className="relative mt-2 p-4 rounded-lg border bg-gray-100">
                        <button
                          className="absolute bottom-3 right-2 text-gray-600 hover:text-gray-800"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          {isEditing ? (
                            <Save className="w-5 h-5" />
                          ) : (
                            <Settings className="w-5 h-5" />
                          )}
                        </button>

                        <div className="flex items-center space-x-3">
                          <Avatar className="h-16 w-16">
                            <img
                              src={userimg}
                              alt="User"
                              className="h-full w-full object-cover rounded-full"
                            />
                          </Avatar>

                          <div className="w-full">
                            {isEditing ? (
                              <>
                                <input
                                  type="text"
                                  className="w-40 px-2 py-1 border rounded-md"
                                  value={fullName}
                                  onChange={(e) => setFullName(e.target.value)}
                                />
                                <input
                                  type="email"
                                  className="w-40 mt-2 px-2 py-1 border rounded-md"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                />
                                <input
                                  type="text"
                                  className="w-40 mt-2 px-2 py-1 border rounded-md"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value)}
                                />
                              </>
                            ) : (
                              <>
                                <p className="text-lg font-bold">{fullName}</p>
                                <p className="text-sm text-gray-600">{email}</p>
                                <p className="text-sm text-gray-600">
                                  Username: {username}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notification Settings */}
                      <div className="mt-4 p-4 rounded-lg border bg-gray-100 flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-semibold">
                            Notification Settings
                          </h3>
                          <p className="text-sm text-gray-600">
                            Manage how you receive alerts and notifications
                          </p>
                        </div>
                        <Switch
                          checked={notificationsEnabled}
                          onCheckedChange={setNotificationsEnabled}
                        />
                      </div>

                      {/* Email Notifications */}
                      <div className="mt-2 p-4 rounded-lg border bg-gray-100 flex justify-between items-center">
                        <div>
                          <h3 className="text-md font-semibold">
                            Email Notifications
                          </h3>
                          <p className="text-sm text-gray-600">
                            Receive weekly summaries and important alerts
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
                  onClick={handleLogout}
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
                  <CardTitle>Financial Overview</CardTitle>
                  <CardDescription>
                    Breakdown of your income sources (Total:{" "}
                    {formatCurrency(totalIncome)})
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
                            outerRadius={120} // Adjusted for balance
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={true}
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
                        No income data to display
                      </p>
                      <Button
                        className="bg-indigo-500 hover:bg-indigo-600 text-white"
                        onClick={addIncomeSource}
                      >
                        Add Income Source
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
                {incomeData.map((income) => (
                  <StatCard
                    key={income.id}
                    id={income.id}
                    title={income.type}
                    amount={income.amount}
                    color={income.color}
                  />
                ))}
              </div>
              <Card
                className="mt-4 p-4 shadow-lg rounded-2xl mb-4 border-2 border-dashed border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
                onClick={addIncomeSource}
              >
                <CardContent className="flex flex-1 flex-col items-center justify-center text-center">
                  <button className="mt-2 flex flex-col items-center text-gray-500 hover:text-indigo-700">
                    <Plus size={28} />
                    <span className="mt-2 font-medium">Add Income Source</span>
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

export default Income;
