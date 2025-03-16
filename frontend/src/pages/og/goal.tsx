import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import {
  Home,
  Wallet,
  PiggyBank,
  List,
  CreditCard,
  Menu,
  Settings,
  Save,
  Plus,
  Calendar,
  DollarSign,
  Target,
  X,
  Trash2,
  Edit,
} from "lucide-react";
import darkfont from "./assets/imgs/darkfont.webp";
import { Switch } from "@/components/ui/switch";
import userimg from "./assets/imgs/user.webp";
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
import { Textarea } from "@/components/ui/textarea";

// Define TypeScript interfaces
interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  amountSaved: number;
  progress: number;
  deadline: string;
  notes?: string;
}

// NavItem component extracted for better reusability
const NavItem = ({ icon: Icon, label, active = false }) => (
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
    <span className="transition-opacity duration-200 opacity-100 group-hover:opacity-100">
      {label}
    </span>
  </div>
);

const Goals = () => {
  // State definitions
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  // New state for notes
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  // Form states
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalAmount, setNewGoalAmount] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [newSavedAmount, setNewSavedAmount] = useState("");
  const [fundsToAdd, setFundsToAdd] = useState("");

  // Event handlers
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    console.log("User logged out");
    // Add actual logout logic here (e.g., clear auth token, redirect to login)
    setIsDialogOpen(false);
  };

  const handleSaveProfile = () => {
    // Add logic to save profile changes to backend
    console.log("Saving profile changes:", { fullName, email, username });
    setIsEditing(false);
  };

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

  // Function to open notes dialog
  const openNotesDialog = (goal: Goal) => {
    setCurrentGoal(goal);
    setNoteContent(goal.notes || "");
    setNoteDialogOpen(true);
  };

  // Function to save notes
  const handleSaveNotes = () => {
    if (!currentGoal) return;

    const updatedGoal: Goal = {
      ...currentGoal,
      notes: noteContent,
    };

    setGoals(
      goals.map((goal) => (goal.id === currentGoal.id ? updatedGoal : goal))
    );
    setNoteDialogOpen(false);

    // For production, you would use an API call here
    /*
    axios
      .put(`/api/goals/${currentGoal.id}/notes`, { notes: noteContent })
      .then(response => {
        setGoals(goals.map(goal => (goal.id === currentGoal.id ? response.data : goal)));
        setNoteDialogOpen(false);
      })
      .catch(error => {
        console.error("Error saving notes:", error);
        alert("Failed to save notes. Please try again.");
      });
    */
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
      notes: "",
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

  // Add these state variables at the beginning of your component with the other state definitions
  const [openWithdrawFunds, setOpenWithdrawFunds] = useState(false);
  const [fundsToWithdraw, setFundsToWithdraw] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");

  // Add this function with your other handler functions
  const openWithdrawFundsDialog = (goal: Goal) => {
    setCurrentGoal(goal);
    setFundsToWithdraw("");
    setWithdrawReason("");
    setOpenWithdrawFunds(true);
  };

  // Add this handler function for processing withdrawals
  const handleWithdrawFunds = () => {
    if (!currentGoal || !fundsToWithdraw) {
      alert("Please enter an amount to withdraw");
      return;
    }

    const amount = parseFloat(fundsToWithdraw);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
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
        targetAmount: 10000,
        amountSaved: 5000,
        progress: 50,
        deadline: "2025-06-30",
        notes: "Need to increase monthly contributions to reach goal on time."
      },
      {
        id: 2,
        name: "Vacation",
        targetAmount: 3000,
        amountSaved: 1200,
        progress: 40,
        deadline: "2025-12-15",
        notes: "Looking at destinations in Europe. Need to research flight costs."
      },
      {
        id: 3,
        name: "New Car",
        targetAmount: 25000,
        amountSaved: 8750,
        progress: 35,
        deadline: "2026-03-01",
        notes: "Considering hybrid models. May need to adjust target amount."
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
      currency: "USD",
    }).format(amount);
  };

  // Format date values
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Get short note preview
  const getNotePreview = (note) => {
    if (!note) return "No notes";
    return note.length > 50 ? note.substring(0, 50) + "..." : note;
  };

  return (
    <div className="flex h-screen bg-indigo-100 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-0 z-50 h-screen bg-white shadow-md p-4 transition-all duration-300 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:w-64 md:flex-shrink-0`}
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
          <NavItem icon={Home} label="Dashboard" />
          <NavItem icon={Wallet} label="Income" />
          <NavItem icon={CreditCard} label="Expenses" />
          <NavItem icon={PiggyBank} label="Goals" active={true} />
          <NavItem icon={List} label="Budgets" />
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
                Financial Goals Overview
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
                      {/* Profile content remains the same */}
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
        <main className="flex-1 p-4 overflow-y-auto">
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
                  <Label htmlFor="targetAmount">Target Amount ($)</Label>
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
                  <Label htmlFor="editTargetAmount">Target Amount ($)</Label>
                  <Input
                    id="editTargetAmount"
                    type="number"
                    value={newGoalAmount}
                    onChange={(e) => setNewGoalAmount(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editSavedAmount">Saved Amount ($)</Label>
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
                  <Label htmlFor="fundsAmount">Amount to Add ($)</Label>
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

          {/* Withdraw Funds Dialog */}
          <Dialog open={openWithdrawFunds} onOpenChange={setOpenWithdrawFunds}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Withdraw Funds from Goal</DialogTitle>
                <DialogDescription>
                  {currentGoal
                    ? `Withdraw from ${currentGoal.name}`
                    : "Withdraw funds"}
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
                    <Progress
                      value={currentGoal.progress}
                      className="h-2 w-full mt-2"
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="withdrawAmount">Amount to Withdraw ($)</Label>
                  <Input
                    id="withdrawAmount"
                    type="number"
                    placeholder="500"
                    value={fundsToWithdraw}
                    onChange={(e) => setFundsToWithdraw(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="withdrawReason">Reason (Optional)</Label>
                  <Textarea
                    id="withdrawReason"
                    placeholder="Enter the reason for this withdrawal"
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenWithdrawFunds(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-900 hover:bg-indigo-700 text-white"
                  onClick={handleWithdrawFunds}
                >
                  Withdraw Funds
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Notes Dialog */}
          <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  Goal Notes
                  {currentGoal && ` - ${currentGoal.name}`}
                </DialogTitle>
                <DialogDescription>
                  Add or update notes for this financial goal.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add your notes here..."
                    className="min-h-[150px]"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-900 hover:bg-indigo-700 text-white"
                  onClick={handleSaveNotes}
                >
                  Save Notes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Transaction Notes Dialog */}
          <Dialog open={transactionNoteDialogOpen} onOpenChange={setTransactionNoteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  Transaction Notes
                  {currentTransaction && 
                    ` - ${formatCurrency(currentTransaction.amount)} ${currentTransaction.type}`}
                </DialogTitle>
                <DialogDescription>
                  Add or update notes for this transaction.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="transactionNotes">Notes</Label>
                  <Textarea
                    id="transactionNotes"
                    placeholder="Add transaction details here..."
                    className="min-h-[150px]"
                    value={transactionNoteContent}
                    onChange={(e) => setTransactionNoteContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTransactionNoteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-indigo-900 hover:bg-indigo-700 text-white"
                  onClick={handleSaveTransactionNotes}
                >
                  Save Notes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Header with Add Goal Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Your Financial Goals</h2>
            <Button
              className="bg-indigo-900 hover:bg-indigo-700 text-white flex items-center gap-2"
              onClick={openAddGoalDialog}
            >
              <Plus size={16} />
              <span>Add Goal</span>
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-500">Loading goals...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* No Goals State */}
          {!isLoading && !error && goals.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <PiggyBank
                size={48}
                className="mx-auto text-indigo-900 opacity-50 mb-4"
              />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Financial Goals Yet
              </h3>
              <p className="text-gray-500 mb-4">
                Create your first savings goal to start tracking your progress.
              </p>
              <Button
                className="bg-indigo-900 hover:bg-indigo-700 text-white"
                onClick={openAddGoalDialog}
              >
                Create Your First Goal
              </Button>
            </div>
          )}

          {/* Goals Grid */}
          {!isLoading && !error && goals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {goals.map((goal) => (
                <Card key={goal.id} className="overflow-hidden">
                  <CardHeader className="bg-indigo-50 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{goal.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          <span>Due: {formatDate(goal.deadline)}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500"
                          >
                            <Edit size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditGoalDialog(goal)}>
                            Edit Goal
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteGoalDialog(goal)}>
                            Delete Goal
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openNotesDialog(goal)}>
                            Update Notes
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="mb-4">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Saved</div>
                        <div className="font-semibold">
                          {formatCurrency(goal.amountSaved)}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500">Target</div>
                        <div className="font-semibold">
                          {formatCurrency(goal.targetAmount)}
                        </div>
                      </div>
                    </div>
                    {goal.notes && (
                      <div
                        className="bg-gray-50 p-2 rounded mb-4 text-sm cursor-pointer hover:bg-gray-100"
                        onClick={() => openNotesDialog(goal)}
                      >
                        <div className="font-medium mb-1">Notes:</div>
                        <div className="text-gray-600">
                          {getNotePreview(goal.notes)}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="text-sm h-9"
                        onClick={() => openWithdrawFundsDialog(goal)}
                      >
                        Withdraw
                      </Button>
                      <Button
                        className="bg-indigo-900 hover:bg-indigo-700 text-white text-sm h-9"
                        onClick={() => openAddFundsDialog(goal)}
                      >
                        Add Funds
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Transactions Section */}
          {!isLoading && !error && recentTransactions.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Goal</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((transaction) => {
                        const relatedGoal = goals.find(
                          (g) => g.id === transaction.goalId
                        );
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell>{formatDate(transaction.date)}</TableCell>
                            <TableCell>
                              {relatedGoal ? relatedGoal.name : "Unknown Goal"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-block px-2 py-1 text-xs rounded ${
                                  transaction.type === "deposit"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {transaction.type === "deposit"
                                  ? "Deposit"
                                  : "Withdrawal"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              {getNotePreview(transaction.notes || "")}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => openTransactionNoteDialog(transaction)}
                              >
                                <Edit size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Function to format currency values - moved outside the component
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Function to format date values - moved outside the component
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};

// Function to get short note preview - moved outside the component
const getNotePreview = (note) => {
  if (!note) return "No notes";
  return note.length > 50 ? note.substring(0, 50) + "..." : note;
};

export default Goals;
              