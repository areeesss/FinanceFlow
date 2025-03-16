import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  PiggyBank,
  Plus,
  Trash2,
} from "lucide-react";
import darkfont from "@/assets/imgs/darkfont.webp";
import { Switch } from "@/components/ui/switch";
import userimg from "@/assets/imgs/user.webp";
import { Separator } from "@/components/ui/separator";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define TypeScript interfaces
interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  amountSaved: number;
  progress: number;
  deadline: string;
}

const FinanceGoal = () => {
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    console.log("User logged out");
    // Add actual logout logic here (e.g., clear auth token, redirect to login)
  };

  const [fullName, setFullName] = useState("Test User");
  const [email, setEmail] = useState("test@example.com");
  const [username, setUsername] = useState("TestUser");
  const [isEditing, setIsEditing] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for dialogs
  const [addGoalOpen, setAddGoalOpen] = useState(false);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [deleteGoalOpen, setDeleteGoalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<Goal | null>(null);

  // Form states
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalAmount, setNewGoalAmount] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newSavedAmount, setNewSavedAmount] = useState("");
  const [fundsToAdd, setFundsToAdd] = useState("");

  // Function to open add goal dialog
  const openAddGoalDialog = () => {
    setNewGoalName("");
    setNewGoalAmount("");
    setNewGoalDeadline("");
    setAddGoalOpen(true);
  };

  // Function to open edit goal dialog
  const openEditGoalDialog = (goal: Goal) => {
    setCurrentGoal(goal);
    setNewGoalName(goal.name);
    setNewGoalAmount(goal.targetAmount.toString());
    setNewSavedAmount(goal.amountSaved.toString());
    setNewGoalDeadline(goal.deadline);
    setEditGoalOpen(true);
  };

  // Function to open delete goal confirmation dialog
  const openDeleteGoalDialog = (goal: Goal) => {
    setCurrentGoal(goal);
    setDeleteGoalOpen(true);
  };

  // Function to open add funds dialog
  const openAddFundsDialog = (goal: Goal) => {
    setCurrentGoal(goal);
    setFundsToAdd("");
    setAddFundsOpen(true);
  };

  // Function to handle adding a new goal
  const handleAddGoal = () => {
    if (!newGoalName || !newGoalAmount || !newGoalDeadline) {
      alert("Please fill in all fields");
      return;
    }

    const targetAmount = parseFloat(newGoalAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      alert("Please enter a valid target amount");
      return;
    }

    const newGoal: Goal = {
      id: goals.length > 0 ? Math.max(...goals.map((g) => g.id)) + 1 : 1,
      name: newGoalName,
      targetAmount: targetAmount,
      amountSaved: 0,
      progress: 0,
      deadline: newGoalDeadline,
    };

    setGoals([...goals, newGoal]);
    setAddGoalOpen(false);

    // For production, you would use an API call here
    /*
        axios
          .post("/api/goals", newGoal)
          .then(response => {
            setGoals([...goals, response.data]);
            setAddGoalOpen(false);
          })
          .catch(error => {
            console.error("Error adding goal:", error);
            alert("Failed to add goal. Please try again.");
          });
        */
  };

  // Add this handler function for processing withdrawals
  const handleWithdrawFunds = () => {
    if (!currentGoal || !fundsToWithdraw) {
      alert("Please enter an amount to withdraw");
      return;
    }

    if (amount > currentGoal.amountSaved) {
      alert("You cannot withdraw more than your current savings");
      return;
    }

    const newAmountSaved = currentGoal.amountSaved - amount;
    const newProgress = (newAmountSaved / currentGoal.targetAmount) * 100;

    const updatedGoal: Goal = {
      ...currentGoal,
      amountSaved: newAmountSaved,
      progress: Math.max(0, Math.round(newProgress)),
    };

    setGoals(
      goals.map((goal) => (goal.id === currentGoal.id ? updatedGoal : goal))
    );
    setOpenWithdrawFunds(false);

    // For production, you would use an API call here
    /*
      axios
        .put(`/api/goals/${currentGoal.id}/withdraw`, { amount, reason: withdrawReason })
        .then(response => {
          setGoals(goals.map(goal => (goal.id === currentGoal.id ? response.data : goal)));
          setOpenWithdrawFunds(false);
        })
        .catch(error => {
          console.error("Error withdrawing funds:", error);
          alert("Failed to withdraw funds. Please try again.");
        });
      */
  };

  // Function to handle editing a goal
  const handleEditGoal = () => {
    if (
      !currentGoal ||
      !newGoalName ||
      !newGoalAmount ||
      !newGoalDeadline ||
      !newSavedAmount
    ) {
      alert("Please fill in all fields");
      return;
    }

    const targetAmount = parseFloat(newGoalAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      alert("Please enter a valid target amount");
      return;
    }

    const amountSaved = parseFloat(newSavedAmount);
    if (isNaN(amountSaved) || amountSaved < 0) {
      alert("Please enter a valid saved amount");
      return;
    }

    // Calculate new progress based on the new amounts
    const newProgress = (amountSaved / targetAmount) * 100;

    const updatedGoal: Goal = {
      ...currentGoal,
      name: newGoalName,
      targetAmount: targetAmount,
      amountSaved: amountSaved,
      deadline: newGoalDeadline,
      progress: Math.min(100, Math.round(newProgress)),
    };

    setGoals(
      goals.map((goal) => (goal.id === currentGoal.id ? updatedGoal : goal))
    );
    setEditGoalOpen(false);

    // For production, you would use an API call here
    /*
        axios
          .put(`/api/goals/${currentGoal.id}`, updatedGoal)
          .then(response => {
            setGoals(goals.map(goal => (goal.id === currentGoal.id ? response.data : goal)));
            setEditGoalOpen(false);
          })
          .catch(error => {
            console.error("Error updating goal:", error);
            alert("Failed to update goal. Please try again.");
          });
        */
  };

  // Function to handle deleting a goal
  const handleDeleteGoal = () => {
    if (!currentGoal) return;

    // Filter out the goal to be deleted
    setGoals(goals.filter((goal) => goal.id !== currentGoal.id));
    setDeleteGoalOpen(false);

    // For production, you would use an API call here
    /*
        axios
          .delete(`/api/goals/${currentGoal.id}`)
          .then(() => {
            setGoals(goals.filter(goal => goal.id !== currentGoal.id));
            setDeleteGoalOpen(false);
          })
          .catch(error => {
            console.error("Error deleting goal:", error);
            alert("Failed to delete goal. Please try again.");
          });
        */
  };

  // Function to handle adding funds to a goal
  const handleAddFunds = () => {
    if (!currentGoal || !fundsToAdd) {
      alert("Please enter an amount to add");
      return;
    }

    const amount = parseFloat(fundsToAdd);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const newAmountSaved = currentGoal.amountSaved + amount;
    const newProgress = (newAmountSaved / currentGoal.targetAmount) * 100;

    const updatedGoal: Goal = {
      ...currentGoal,
      amountSaved: newAmountSaved,
      progress: Math.min(100, Math.round(newProgress)),
    };

    setGoals(
      goals.map((goal) => (goal.id === currentGoal.id ? updatedGoal : goal))
    );
    setAddFundsOpen(false);

    // For production, you would use an API call here
    /*
        axios
          .put(`/api/goals/${currentGoal.id}/funds`, { amount })
          .then(response => {
            setGoals(goals.map(goal => (goal.id === currentGoal.id ? response.data : goal)));
            setAddFundsOpen(false);
          })
          .catch(error => {
            console.error("Error adding funds:", error);
            alert("Failed to add funds. Please try again.");
          });
        */
  };

  // Fetch goals data
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // For development, you can use a mock API response
    const mockGoals = [
      {
        id: 1,
        name: "Emergency Fund",
        targetAmount: 5000,
        amountSaved: 2000,
        progress: 50,
        deadline: "2025-06-30",
      },
      {
        id: 2,
        name: "Vacation",
        targetAmount: 3000,
        amountSaved: 1200,
        progress: 40,
        deadline: "2025-12-15",
      },
    ];

    // Simulating API call - replace with actual API call in production
    setTimeout(() => {
      setGoals(mockGoals);
      setIsLoading(false);
    }, 1000);

    // Uncomment for actual API implementation
    /*
        axios
          .get("/api/goals")
          .then((response) => {
            setGoals(Array.isArray(response.data) ? response.data : []);
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("API Error:", error);
            setError("Failed to load goals. Please try again.");
            setGoals([]);
            setIsLoading(false);
          });
        */
  }, []);

  // Format currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  // Format date values
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const [note, setNote] = useState(
    "- Added +1,000 on my Emergency Fund on March 12, 2025"
  );

  return (
    <div className="flex h-screen bg-indigo-100 overflow-hidden">
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
            <NavItem icon={CreditCard} label="Expenses" isSidebarOpen={true} />
          </Link>
          <Link to="/financegoal">
            <NavItem icon={Goal} label="Goals" active isSidebarOpen={true} />
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
                Financial Goal Overview
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/aboutus">
                <button className="text-base sm:text-lg md:text-xl font-bold text-black hover:underline">
                  About Us
                </button>
              </Link>

              {/* Avatar with Dropdown */}
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
                      side="right"
                      align="start"
                      className="w-80 p-4 bg-white shadow-lg rounded-md"
                    >
                      {/* ✅ Section: Personal Information */}
                      <h2 className="text-xl font-semibold">
                        Personal Information
                      </h2>
                      <div className="relative mt-2 p-4 rounded-lg border bg-gray-100">
                        {/* ✅ Toggle between Settings and Save button */}
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
                            {isEditing ? ( // ✅ If in edit mode, show input fields
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
                              // ✅ Otherwise, display text
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

                      {/* ✅ Section: Notification Settings */}
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

                      {/* ✅ Section: Email Notifications */}
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
        <main className="flex-1 p-3 overflow-y-auto">
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

          {/* Add Goal Dialog */}
          <Dialog open={addGoalOpen} onOpenChange={setAddGoalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Financial Goal</DialogTitle>
                <DialogDescription>
                  Create a new savings goal to track your progress.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="goalName">Goal Name</Label>
                  <Input
                    id="goalName"
                    placeholder="e.g., Vacation, Emergency Fund"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetAmount">Target Amount (₱)</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="5000"
                    value={newGoalAmount}
                    onChange={(e) => setNewGoalAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Target Date</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newGoalDeadline}
                    onChange={(e) => setNewGoalDeadline(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddGoalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-900 hover:bg-indigo-700 text-white"
                  onClick={handleAddGoal}
                >
                  Create Goal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Goal Dialog */}
          <Dialog open={editGoalOpen} onOpenChange={setEditGoalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Financial Goal</DialogTitle>
                <DialogDescription>
                  Update your savings goal details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="editGoalName">Goal Name</Label>
                  <Input
                    id="editGoalName"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editTargetAmount">Target Amount (₱)</Label>
                  <Input
                    id="editTargetAmount"
                    type="number"
                    value={newGoalAmount}
                    onChange={(e) => setNewGoalAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editSavedAmount">Saved Amount (₱)</Label>
                  <Input
                    id="editSavedAmount"
                    type="number"
                    value={newSavedAmount}
                    onChange={(e) => setNewSavedAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editDeadline">Target Date</Label>
                  <Input
                    id="editDeadline"
                    type="date"
                    value={newGoalDeadline}
                    onChange={(e) => setNewGoalDeadline(e.target.value)}
                  />
                </div>
                {currentGoal && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <div className="text-sm">
                      Current progress: {currentGoal.progress}%
                    </div>
                    <Progress
                      value={currentGoal.progress}
                      className="h-2 flex-1"
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditGoalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-900 hover:bg-indigo-700 text-white"
                  onClick={handleEditGoal}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Goal Confirmation Dialog */}
          <AlertDialog open={deleteGoalOpen} onOpenChange={setDeleteGoalOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
                <AlertDialogDescription>
                  {currentGoal &&
                    `Are you sure you want to delete "${currentGoal.name}"? This action cannot be undone.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="bg-indigo-100 hover:bg-indigo-300"
                  onClick={() => setDeleteGoalOpen(false)}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={handleDeleteGoal}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Add Funds Dialog */}
          <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Funds to Goal</DialogTitle>
                <DialogDescription>
                  {currentGoal
                    ? `Update your savings for ${currentGoal.name}`
                    : "Update your savings"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {currentGoal && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between mb-2">
                      <span>Current savings:</span>
                      <span className="font-semibold">
                        {formatCurrency(currentGoal.amountSaved)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target amount:</span>
                      <span className="font-semibold">
                        {formatCurrency(currentGoal.targetAmount)}
                      </span>
                    </div>
                    <div className="mt-2">
                      <Progress
                        value={currentGoal.progress}
                        className="h-2 w-full"
                      />
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>{currentGoal.progress}% complete</span>
                        <span>
                          {formatCurrency(
                            currentGoal.targetAmount - currentGoal.amountSaved
                          )}{" "}
                          remaining
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="fundsAmount">Amount to Add (₱)</Label>
                  <Input
                    id="fundsAmount"
                    type="number"
                    placeholder="500"
                    value={fundsToAdd}
                    onChange={(e) => setFundsToAdd(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setAddFundsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-900 hover:bg-indigo-700 text-white"
                  onClick={handleAddFunds}
                >
                  Add Funds
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Top Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-white shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 flex">Total Savings</p>
                  <h3 className="text-2xl font-bold">
                    {formatCurrency(
                      goals.reduce((sum, goal) => sum + goal.amountSaved, 0)
                    )}
                  </h3>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <PiggyBank className="w-6 h-6 text-indigo-900" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Active Goals</p>
                  <h3 className="text-2xl font-bold">{goals.length}</h3>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <List className="w-6 h-6 text-indigo-900" />
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500">Average Progress</p>
                  <h3 className="text-2xl font-bold">
                    {goals.length
                      ? Math.round(
                          goals.reduce((sum, goal) => sum + goal.progress, 0) /
                            goals.length
                        )
                      : 0}
                    %
                  </h3>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <CreditCard className="w-6 h-6 text-indigo-900" />
                </div>
              </div>
            </Card>
          </div>

          {/* Goals Table */}
          <Card className="shadow-md">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <h2 className="md:text-base text-xl font-semibold">
                  Financial Goals
                </h2>
                <Button
                  className="bg-indigo-400 hover:bg-indigo-600"
                  onClick={openAddGoalDialog}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <p>Loading goals...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : goals.length === 0 ? (
                <div className="text-center py-8">
                  <p>No goals found. Create your first financial goal!</p>
                  <Button
                    className="mt-2 bg-indigo-900 hover:bg-indigo-700"
                    onClick={openAddGoalDialog}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Create Goal
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Goal Name</TableHead>
                      <TableHead className="text-center">Target</TableHead>
                      <TableHead className="text-center">Saved</TableHead>
                      <TableHead className="text-center">Progress</TableHead>
                      <TableHead className="text-center">Deadline</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {goals.map((goal) => (
                      <TableRow key={goal.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {goal.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatCurrency(goal.targetAmount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {formatCurrency(goal.amountSaved)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={goal.progress}
                              className="h-2 flex-1"
                            />
                            <span className="text-xs text-gray-500 min-w-[36px]">
                              {goal.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {formatDate(goal.deadline)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openAddFundsDialog(goal)}
                              title="Add Funds"
                            >
                              <Plus className="h-4 w-4 text-indigo-900" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditGoalDialog(goal)}
                              title="Edit Goal"
                            >
                              <Settings className="h-4 w-4 text-gray-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteGoalDialog(goal)}
                              title="Delete Goal"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <Card className=" bg-white gap-4 mt-6">
              <CardHeader className="pb-2">
                <CardTitle className=" md:text-base text-lg font-bold">
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="bg-gray-100 text-sm md:text-base min-h-24"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </CardContent>
            </Card>
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

export default FinanceGoal;
