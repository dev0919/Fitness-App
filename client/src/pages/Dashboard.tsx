import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { StatsCard, StreakCard } from "@/components/dashboard/StatsCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentWorkouts } from "@/components/dashboard/RecentWorkouts";
import { FriendActivity } from "@/components/dashboard/FriendActivity";
import { UpcomingChallenges } from "@/components/dashboard/UpcomingChallenges";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  PlusCircle, 
  BarChart3, 
  RefreshCcw,
  Bell
} from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { connected } = useWebSocket();
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

  // Calculate progress percentages
  const calculateStepProgress = () => {
    const steps = dashboardData?.stats.steps || 0;
    const goal = 10000; // Daily step goal
    const percentage = Math.min(Math.round((steps / goal) * 100), 100);
    return {
      percentage,
      goalText: `${percentage}% of daily goal`
    };
  };
  
  const calculateCalorieProgress = () => {
    const calories = dashboardData?.stats.calories || 0;
    const goal = 500; // Daily calorie burn goal
    const percentage = Math.min(Math.round((calories / goal) * 100), 100);
    return {
      percentage,
      goalText: `${percentage}% of daily goal`
    };
  };
  
  const calculateWorkoutProgress = () => {
    const workouts = dashboardData?.stats.workouts || 0;
    const goal = 5; // Weekly workout goal
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
        <StatsCard
          title="Steps Today"
          value={dashboardData?.stats.steps.toLocaleString() || "0"}
          icon="fa-shoe-prints"
          iconBgColor="bg-[#81C784]"
          iconColor="text-[#388E3C]"
          progress={stepProgress.percentage}
          goalText={stepProgress.goalText}
        />
        
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
      
      {/* Weekly Activity Chart */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-[#E0E0E0]">
            <h3 className="text-lg leading-6 font-medium text-[#212121]">
              Weekly Activity
            </h3>
            <p className="mt-1 text-sm text-[#616161]">
              Your activity over the past 7 days
            </p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="h-80">
              {dashboardData?.weeklyActivities && (
                <ActivityChart weeklyActivities={dashboardData.weeklyActivities} />
              )}
            </div>
          </div>
        </div>
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
