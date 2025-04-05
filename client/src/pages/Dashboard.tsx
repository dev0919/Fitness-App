import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { StatsCard, StreakCard } from "@/components/dashboard/StatsCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentWorkouts } from "@/components/dashboard/RecentWorkouts";
import { FriendActivity } from "@/components/dashboard/FriendActivity";
import { UpcomingChallenges } from "@/components/dashboard/UpcomingChallenges";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  PlusCircle, 
  BarChart3, 
  RefreshCcw,
  Bell,
  Settings
} from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [notifications, setNotifications] = useState<{id: number, message: string, type: string, time: Date}[]>([]);
  
  // Fetch dashboard data with refresh interval
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: ['/api/stats/current'],
    refetchInterval: realtimeEnabled ? 30000 : false, // Refresh every 30 seconds if real-time is enabled
  });

  // Fetch upcoming challenges
  const { 
    data: challengesData, 
    isLoading: isChallengesLoading,
    refetch: refetchChallenges
  } = useQuery({
    queryKey: ['/api/challenges/upcoming'],
    refetchInterval: realtimeEnabled ? 60000 : false, // Refresh every 60 seconds if real-time is enabled
  });

  // Fetch friend activities
  const { 
    data: friendActivitiesData, 
    isLoading: isFriendActivitiesLoading,
    refetch: refetchFriendActivities
  } = useQuery({
    queryKey: ['/api/social/activities/friends'],
    refetchInterval: realtimeEnabled ? 45000 : false, // Refresh every 45 seconds if real-time is enabled
  });

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
  });
  
  // Simulate WebSocket connection
  useEffect(() => {
    if (realtimeEnabled) {
      // Simulate a connection delay
      const timer = setTimeout(() => {
        setConnected(true);
        
        // Add initial notification
        addNotification("Connected to real-time updates", "info");
      }, 1500);
      
      return () => {
        clearTimeout(timer);
        setConnected(false);
      };
    } else {
      setConnected(false);
    }
  }, [realtimeEnabled]);

  // Function to manually refresh all data
  const refreshAllData = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchDashboard(),
      refetchChallenges(),
      refetchFriendActivities()
    ]);
    
    // Add a notification
    addNotification("Dashboard data refreshed", "info");
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Add a notification
  const addNotification = (message: string, type: string = "info") => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      time: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    
    // Show toast for important notifications
    if (type === "achievement" || type === "challenge") {
      toast({
        title: type === "achievement" ? "Achievement Unlocked!" : "Challenge Update",
        description: message,
        variant: "default"
      });
    }
  };
  
  // Simulate real-time updates using WebSocket
  useEffect(() => {
    if (!connected || !realtimeEnabled) return;
    
    // Simulate receiving notifications through WebSocket
    const simulateActivityUpdates = () => {
      const activities = [
        "A friend completed a workout",
        "New challenge available: Weekend Warrior",
        "You're close to your step goal today!",
        "Your friend Sarah just beat your running record",
        "Achievement unlocked: 3-day streak"
      ];
      
      const types = ["info", "challenge", "goal", "friend", "achievement"];
      
      const randomInterval = Math.floor(Math.random() * 60000) + 30000; // 30-90 seconds
      
      const timer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * activities.length);
        const message = activities[randomIndex];
        const type = types[randomIndex];
        
        // Add notification
        addNotification(message, type);
        
        // Invalidate relevant queries to refresh data
        if (type === "friend") {
          queryClient.invalidateQueries({ queryKey: ['/api/social/activities/friends'] });
        } else if (type === "challenge") {
          queryClient.invalidateQueries({ queryKey: ['/api/challenges/upcoming'] });
        } else if (type === "goal" || type === "achievement") {
          queryClient.invalidateQueries({ queryKey: ['/api/stats/current'] });
        }
        
        // Set up the next update
        simulateActivityUpdates();
      }, randomInterval);
      
      return () => clearTimeout(timer);
    };
    
    const cleanup = simulateActivityUpdates();
    return cleanup;
  }, [connected, realtimeEnabled, queryClient]);
  
  // Create streak days data
  const getDaysOfWeek = () => {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, ...
    const streakDays = [];
    
    // Adjust for our display (Monday first)
    const adjustedToday = today === 0 ? 6 : today - 1;
    
    for (let i = 0; i < 7; i++) {
      streakDays.push({
        day: days[i],
        completed: dashboardData?.stats.streak > 0 && i < adjustedToday
      });
    }
    
    return streakDays;
  };

  // Prepare friend activities data
  const prepareFriendActivities = () => {
    if (!friendActivitiesData) return [];
    
    return friendActivitiesData.map((activity: any) => ({
      activity,
      user: {
        id: activity.userId || 1,
        username: activity.username || 'user1',
        firstName: activity.firstName || 'Sarah',
        lastName: activity.lastName || 'Williams',
        profileImage: activity.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80'
      },
      interactions: {
        likes: activity.likes || 0,
        likedByCurrentUser: activity.likedByCurrentUser || false,
        comments: activity.comments || 0
      }
    }));
  };

  // Prepare challenges data
  const prepareChallenges = () => {
    if (!challengesData) return [];
    
    return challengesData.map((challenge: any) => ({
      ...challenge,
      participantsCount: challenge.participantsCount || 0
    }));
  };

  // Form schema for goal settings
  const GoalSettingsSchema = z.object({
    dailyStepGoal: z.coerce.number().min(1000, "Step goal must be at least 1,000").max(100000, "Step goal cannot exceed 100,000"),
    dailyCalorieGoal: z.coerce.number().min(100, "Calorie goal must be at least 100").max(5000, "Calorie goal cannot exceed 5,000"),
    weeklyWorkoutGoal: z.coerce.number().min(1, "Weekly workout goal must be at least 1").max(14, "Weekly workout goal cannot exceed 14")
  });

  // Settings form
  const goalSettingsForm = useForm<z.infer<typeof GoalSettingsSchema>>({
    resolver: zodResolver(GoalSettingsSchema),
    defaultValues: {
      dailyStepGoal: userData?.dailyStepGoal || 10000,
      dailyCalorieGoal: userData?.dailyCalorieGoal || 500,
      weeklyWorkoutGoal: userData?.weeklyWorkoutGoal || 5
    }
  });

  // Update goal settings when userData changes
  useEffect(() => {
    if (userData) {
      goalSettingsForm.reset({
        dailyStepGoal: userData.dailyStepGoal || 10000,
        dailyCalorieGoal: userData.dailyCalorieGoal || 500,
        weeklyWorkoutGoal: userData?.weeklyWorkoutGoal || 5
      });
    }
  }, [userData]);

  // Goal settings mutation
  const updateGoalsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof GoalSettingsSchema>) => {
      if (!userData?.id) {
        throw new Error("User not authenticated");
      }
      return apiRequest(
        'PATCH',
        `/api/users/${userData.id}`,
        data
      );
    },
    onSuccess: () => {
      toast({
        title: "Goals updated",
        description: "Your fitness goals have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      addNotification("Fitness goals updated", "goal");
    },
    onError: (error) => {
      console.error("Goal update error:", error);
      toast({
        title: "Error",
        description: "Failed to update goals. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle goal settings form submission
  const onSubmitGoalSettings = (data: z.infer<typeof GoalSettingsSchema>) => {
    updateGoalsMutation.mutate(data);
  };

  // Calculate progress percentages
  const calculateStepProgress = () => {
    const steps = dashboardData?.stats.steps || 0;
    const goal = userData?.dailyStepGoal || 10000; // Use user's custom goal or default
    const percentage = Math.min(Math.round((steps / goal) * 100), 100);
    return {
      percentage,
      goalText: `${percentage}% of daily goal`
    };
  };
  
  const calculateCalorieProgress = () => {
    const calories = dashboardData?.stats.calories || 0;
    const goal = userData?.dailyCalorieGoal || 500; // Use user's custom goal or default
    const percentage = Math.min(Math.round((calories / goal) * 100), 100);
    return {
      percentage,
      goalText: `${percentage}% of daily goal`
    };
  };
  
  const calculateWorkoutProgress = () => {
    const workouts = dashboardData?.stats.workouts || 0;
    const goal = userData?.weeklyWorkoutGoal || 5; // Use user's custom goal or default
    const percentage = Math.min(Math.round((workouts / goal) * 100), 100);
    return {
      percentage,
      goalText: `${workouts} of ${goal} weekly goal`
    };
  };

  if (isDashboardLoading) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate step progress
  const stepProgress = calculateStepProgress();
  const calorieProgress = calculateCalorieProgress();
  const workoutProgress = calculateWorkoutProgress();

  return (
    <div className="px-4 py-6 md:px-8" id="dashboard-content">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#212121]">Dashboard</h2>
          <p className="text-[#616161] mt-1">
            Welcome back, <span>{userData?.firstName || 'User'}</span>!
            {connected && realtimeEnabled && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></span> 
                Live
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <button 
            onClick={() => setRealtimeEnabled(!realtimeEnabled)}
            className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
              realtimeEnabled 
                ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            {realtimeEnabled ? 'Live Updates On' : 'Live Updates Off'}
          </button>
          
          <button 
            onClick={refreshAllData}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50]"
          >
            <RefreshCcw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          {/* Goal Settings Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50]">
                <Settings className="w-4 h-4 mr-1" />
                Goals
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Fitness Goals</SheetTitle>
                <SheetDescription>
                  Customize your daily fitness goals
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-6">
                <Form {...goalSettingsForm}>
                  <form onSubmit={goalSettingsForm.handleSubmit(onSubmitGoalSettings)} className="space-y-6">
                    <FormField
                      control={goalSettingsForm.control}
                      name="dailyStepGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Step Goal</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10000" 
                              {...field} 
                              min="1000"
                              max="100000"
                              className="w-full"
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            Recommended: 7,000-10,000 steps per day
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={goalSettingsForm.control}
                      name="dailyCalorieGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Daily Calorie Burn Goal</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="500" 
                              {...field}
                              min="100"
                              max="5000"
                              className="w-full"
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            Recommended: 400-600 calories from exercise
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={goalSettingsForm.control}
                      name="weeklyWorkoutGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weekly Workout Goal</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5" 
                              {...field}
                              min="1"
                              max="14"
                              className="w-full"
                            />
                          </FormControl>
                          <p className="text-sm text-muted-foreground">
                            Recommended: 3-5 workouts per week
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <SheetFooter>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={updateGoalsMutation.isPending || !goalSettingsForm.formState.isDirty}
                      >
                        {updateGoalsMutation.isPending ? 'Saving...' : 'Save Goals'}
                      </Button>
                    </SheetFooter>
                  </form>
                </Form>
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Notifications Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50] relative">
                <Bell className="w-4 h-4 mr-1" />
                Notifications
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Activity Notifications</SheetTitle>
                <SheetDescription>
                  Recent updates from your fitness activities and friends
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-3 rounded-lg border ${
                        notification.type === 'achievement' 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : notification.type === 'challenge'
                          ? 'bg-purple-50 border-purple-200'
                          : notification.type === 'friend'
                          ? 'bg-blue-50 border-blue-200'
                          : notification.type === 'goal'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{notification.message}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          <Link href="/workouts/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50]">
            <PlusCircle className="w-4 h-4 mr-2" />
            Start a Workout
          </Link>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <StatsCard
            title="Steps Today"
            value={dashboardData?.stats.steps.toLocaleString() || "0"}
            icon="fa-shoe-prints"
            iconBgColor="bg-[#81C784]"
            iconColor="text-[#388E3C]"
            progress={stepProgress.percentage}
            goalText={stepProgress.goalText}
          />
          <button 
            onClick={() => {
              const steps = window.prompt("Enter step count for today:", dashboardData?.stats.steps.toString());
              if (steps !== null) {
                const stepsNum = parseInt(steps, 10);
                if (!isNaN(stepsNum) && stepsNum >= 0) {
                  apiRequest('POST', '/api/activities/log', {
                    steps: stepsNum
                  }).then(() => {
                    queryClient.invalidateQueries({ queryKey: ['/api/stats/current'] });
                    addNotification(`Updated step count to ${stepsNum}`, "goal");
                    toast({
                      title: "Steps Updated",
                      description: `Your step count has been updated to ${stepsNum}.`
                    });
                  }).catch(error => {
                    console.error("Failed to update steps:", error);
                    toast({
                      title: "Error",
                      description: "Failed to update step count.",
                      variant: "destructive"
                    });
                  });
                }
              }
            }}
            className="absolute bottom-2 right-2 bg-green-100 hover:bg-green-200 text-green-800 rounded p-1"
            title="Update Steps"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
        
        <StatsCard
          title="Calories Burned"
          value={dashboardData?.stats.calories.toLocaleString() || "0"}
          icon="fa-fire"
          iconBgColor="bg-[#FF8A65]"
          iconColor="text-[#E64A19]"
          progress={calorieProgress.percentage}
          goalText={calorieProgress.goalText}
        />
        
        <StatsCard
          title="Workouts This Week"
          value={dashboardData?.stats.workouts || "0"}
          icon="fa-dumbbell"
          iconBgColor="bg-[#64B5F6]"
          iconColor="text-[#1976D2]"
          progress={workoutProgress.percentage}
          goalText={workoutProgress.goalText}
        />
        
        <StreakCard
          title="Current Streak"
          value={`${dashboardData?.stats.streak || 0} days`}
          icon="fa-bolt"
          iconBgColor="bg-[#FFC107]"
          iconColor="text-white"
          days={getDaysOfWeek()}
        />
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Workouts */}
        <RecentWorkouts workouts={dashboardData?.recentWorkouts || []} />
        
        {/* Friend Activity */}
        <FriendActivity activities={prepareFriendActivities()} />
      </div>
      
      {/* Upcoming Challenges */}
      {!isChallengesLoading && (
        <UpcomingChallenges challenges={prepareChallenges()} />
      )}
    </div>
  );
};

export default Dashboard;
