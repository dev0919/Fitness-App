import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link, useParams } from "wouter";

const Profile = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'achievements'>('overview');
  const params = useParams();
  const userId = params.id ? parseInt(params.id) : undefined;
  
  // Determine if viewing own profile or someone else's
  const isOwnProfile = !userId;
  
  // Fetch user data
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: isOwnProfile ? ['/api/auth/me'] : [`/api/users/${userId}`],
  });
  
  // Fetch user workouts
  const { data: workouts, isLoading: isWorkoutsLoading } = useQuery({
    queryKey: isOwnProfile ? ['/api/workouts'] : [`/api/users/${userId}/workouts`],
    enabled: !!user,
  });
  
  // Fetch user activities
  const { data: activities, isLoading: isActivitiesLoading } = useQuery({
    queryKey: isOwnProfile ? ['/api/activities'] : [`/api/users/${userId}/activities`],
    enabled: !!user,
  });
  
  if (isUserLoading) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate stats (In a real app this would come from the API)
  const totalWorkouts = workouts?.length || 0;
  const totalDistance = workouts?.reduce((acc: number, workout: any) => acc + (workout.distance || 0), 0) || 0;
  const totalCalories = workouts?.reduce((acc: number, workout: any) => acc + (workout.caloriesBurned || 0), 0) || 0;
  
  return (
    <div className="px-4 py-6 md:px-8">
      {/* Profile Header */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex sm:space-x-5">
              <div className="flex-shrink-0">
                <img 
                  className="mx-auto h-20 w-20 rounded-full object-cover" 
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName || ''}&background=random`} 
                  alt={`${user?.firstName} ${user?.lastName || ''}`}
                />
              </div>
              <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                <p className="text-xl font-bold text-[#212121]">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-[#616161]">@{user?.username}</p>
                <p className="text-sm text-[#9E9E9E] mt-1">{user?.email}</p>
              </div>
            </div>
            <div className="mt-5 flex justify-center sm:mt-0">
              {isOwnProfile && (
                <Link href="/edit-profile">
                  <span className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50] cursor-pointer">
                    Edit Profile
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats summary */}
        <div className="border-t border-[#E0E0E0] bg-[#F5F5F5]">
          <dl className="grid grid-cols-3 divide-x divide-[#E0E0E0]">
            <div className="px-4 py-3 sm:p-4 text-center">
              <dt className="text-sm font-medium text-[#616161] truncate">Workouts</dt>
              <dd className="mt-1 text-xl font-semibold text-[#4CAF50]">{totalWorkouts}</dd>
            </div>
            <div className="px-4 py-3 sm:p-4 text-center">
              <dt className="text-sm font-medium text-[#616161] truncate">Distance</dt>
              <dd className="mt-1 text-xl font-semibold text-[#4CAF50]">{(totalDistance / 1000).toFixed(1)} km</dd>
            </div>
            <div className="px-4 py-3 sm:p-4 text-center">
              <dt className="text-sm font-medium text-[#616161] truncate">Calories</dt>
              <dd className="mt-1 text-xl font-semibold text-[#4CAF50]">{totalCalories.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-[#E0E0E0] mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'overview' 
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]' 
              : 'text-[#616161]'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('workouts')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'workouts' 
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]' 
              : 'text-[#616161]'
          }`}
        >
          Workouts
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'achievements' 
              ? 'text-[#4CAF50] border-b-2 border-[#4CAF50]' 
              : 'text-[#616161]'
          }`}
        >
          Achievements
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Activity Summary */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-[#E0E0E0]">
              <h3 className="text-lg leading-6 font-medium text-[#212121]">
                Activity Summary
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              {isActivitiesLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="text-center">
                  <p className="text-[#616161]">Activity data visualization would go here</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#9E9E9E]">No activity data available yet</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Workouts */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-[#E0E0E0] flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-[#212121]">
                Recent Workouts
              </h3>
            </div>
            <div>
              {isWorkoutsLoading ? (
                <div className="animate-pulse p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : workouts && workouts.length > 0 ? (
                <ul className="divide-y divide-[#E0E0E0]">
                  {workouts.slice(0, 3).map((workout: any) => (
                    <li key={workout.id} className="px-4 py-4 hover:bg-[#F5F5F5]">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-[#81C784] flex items-center justify-center">
                            <i className={`fas ${workout.type === 'run' ? 'fa-running' : 'fa-dumbbell'} text-[#4CAF50]`}></i>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-[#212121]">{workout.title}</p>
                            <p className="text-xs text-[#9E9E9E]">
                              {workout.distance ? `${(workout.distance / 1000).toFixed(1)} km • ` : ''}
                              {workout.duration} min
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-[#9E9E9E]">
                          {new Date(workout.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[#9E9E9E]">No workouts recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'workouts' && (
        <div className="bg-white shadow rounded-lg">
          {isWorkoutsLoading ? (
            <div className="animate-pulse p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : workouts && workouts.length > 0 ? (
            <ul className="divide-y divide-[#E0E0E0]">
              {workouts.map((workout: any) => (
                <li key={workout.id} className="px-6 py-4 hover:bg-[#F5F5F5]">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-[#81C784] flex items-center justify-center">
                      <i className={`fas ${workout.type === 'run' ? 'fa-running' : 'fa-dumbbell'} text-[#4CAF50] text-xl`}></i>
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-[#212121]">{workout.title}</h3>
                          <div className="flex items-center text-xs text-[#9E9E9E] mt-1">
                            <span className="mr-3">{new Date(workout.createdAt).toLocaleDateString()}</span>
                            <span className="mr-3">
                              <i className="far fa-clock mr-1"></i> {workout.duration} min
                            </span>
                            {workout.distance && (
                              <span className="mr-3">
                                <i className="fas fa-route mr-1"></i> {(workout.distance / 1000).toFixed(1)} km
                              </span>
                            )}
                            {workout.caloriesBurned && (
                              <span>
                                <i className="fas fa-fire mr-1"></i> {workout.caloriesBurned} cal
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <div className="h-16 w-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-dumbbell text-[#9E9E9E] text-2xl"></i>
              </div>
              <h3 className="text-lg font-medium text-[#212121]">No workouts yet</h3>
              <p className="text-[#616161] mt-1">Start tracking your fitness activities</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'achievements' && (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="h-16 w-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-medal text-[#9E9E9E] text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-[#212121]">Achievements Coming Soon</h3>
          <p className="text-[#616161] mt-1">Track your progress and earn achievements as you reach fitness milestones</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
