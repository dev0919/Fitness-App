import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { StatsCard, StreakCard } from "@/components/dashboard/StatsCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { RecentWorkouts } from "@/components/dashboard/RecentWorkouts";
import { FriendActivity } from "@/components/dashboard/FriendActivity";
import { UpcomingChallenges } from "@/components/dashboard/UpcomingChallenges";
import { PlusCircle } from "lucide-react";

const Dashboard = () => {
  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ['/api/stats/current'],
  });

  // Fetch upcoming challenges
  const { data: challengesData, isLoading: isChallengesLoading } = useQuery({
    queryKey: ['/api/challenges/upcoming'],
  });

  // Fetch friend activities
  const { data: friendActivitiesData, isLoading: isFriendActivitiesLoading } = useQuery({
    queryKey: ['/api/social/activities/friends'],
  });

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['/api/auth/me'],
  });

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
    
    // In a real app, we would fetch user details for each activity
    // and combine with interaction data (likes/comments)
    return friendActivitiesData.map((activity: any) => ({
      activity,
      user: {
        id: 1,
        username: 'user1',
        firstName: 'Sarah',
        lastName: 'Williams',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80'
      },
      interactions: {
        likes: 12,
        likedByCurrentUser: false,
        comments: 3
      }
    }));
  };

  // Prepare challenges data
  const prepareChallenges = () => {
    if (!challengesData) return [];
    
    return challengesData.map((challenge: any) => ({
      ...challenge,
      participantsCount: Math.floor(Math.random() * 200) + 50 // Mock data for demo
    }));
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

  return (
    <div className="px-4 py-6 md:px-8" id="dashboard-content">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#212121]">Dashboard</h2>
          <p className="text-[#616161] mt-1">Welcome back, <span>{userData?.firstName || 'User'}</span>!</p>
        </div>
        <div className="mt-4 md:mt-0">
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
          progress={70} // This would be calculated in a real app
          goalText="70% of daily goal"
        />
        
        <StatsCard
          title="Calories Burned"
          value={dashboardData?.stats.calories.toLocaleString() || "0"}
          icon="fa-fire"
          iconBgColor="bg-[#FF8A65]"
          iconColor="text-[#E64A19]"
          progress={45} // This would be calculated in a real app
          goalText="45% of daily goal"
        />
        
        <StatsCard
          title="Workouts This Week"
          value={dashboardData?.stats.workouts || "0"}
          icon="fa-dumbbell"
          iconBgColor="bg-[#64B5F6]"
          iconColor="text-[#1976D2]"
          progress={60} // This would be calculated in a real app
          goalText={`${dashboardData?.stats.workouts || 0} of 5 weekly goal`}
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
            <div className="h-64">
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
