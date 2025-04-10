import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PlusCircle } from "lucide-react";

const Workouts = () => {
  // Fetch workouts
  const { data: workouts, isLoading } = useQuery({
    queryKey: ['/api/workouts'],
  });

  // Helper function to format workout date
  const formatWorkoutDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to format workout duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes > 0 ? remainingMinutes + 'm' : ''}`;
  };

  // Helper function to get icon by workout type
  const getWorkoutIcon = (type: string) => {
    const icons: Record<string, string> = {
      run: "fa-running",
      strength: "fa-dumbbell",
      cycling: "fa-biking",
      swimming: "fa-swimmer",
      yoga: "fa-om",
      hiking: "fa-hiking",
      default: "fa-heartbeat"
    };
    return icons[type.toLowerCase()] || icons.default;
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#212121]">Workouts</h2>
          <p className="text-[#616161] mt-1">Track and manage your workout sessions</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/workouts/new" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50]">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Workout
          </Link>
        </div>
      </div>
      
      {/* Search and filter */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-[#9E9E9E]"></i>
            </div>
            <input
              type="text"
              placeholder="Search workouts..."
              className="block w-full pl-10 pr-3 py-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50] focus:border-[#4CAF50]"
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-[#E0E0E0] rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4CAF50] focus:border-[#4CAF50]">
              <option value="">All Types</option>
              <option value="run">Running</option>
              <option value="strength">Strength</option>
              <option value="cycling">Cycling</option>
              <option value="swimming">Swimming</option>
              <option value="yoga">Yoga</option>
            </select>
            <select className="border border-[#E0E0E0] rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#4CAF50] focus:border-[#4CAF50]">
              <option value="">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Workouts list */}
      {workouts && workouts.length > 0 ? (
        <div className="space-y-8">
          {/* Active Workouts Section */}
          <div>
            <h3 className="text-xl font-semibold text-[#212121] mb-4">Active Workouts</h3>
            <div className="bg-white shadow rounded-lg">
              {workouts.filter((workout: any) => !workout.completed).length > 0 ? (
                <ul className="divide-y divide-[#E0E0E0]">
                  {workouts
                    .filter((workout: any) => !workout.completed)
                    .map((workout: any) => (
                      <li key={workout.id}>
                        <Link href={`/workouts/${workout.id}`} className="block hover:bg-[#F5F5F5]">
                          <div className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 h-12 w-12 rounded-full ${workout.inProgress ? 'bg-[#FFECB3]' : 'bg-[#E0E0E0]'} flex items-center justify-center`}>
                                <i className={`fas ${getWorkoutIcon(workout.type)} ${workout.inProgress ? 'text-[#FFA000]' : 'text-[#757575]'} text-xl`}></i>
                              </div>
                              <div className="ml-4 flex-grow">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-medium text-[#212121]">{workout.title}</h3>
                                    <div className="flex flex-wrap items-center text-sm text-[#616161] mt-1">
                                      <span className="mr-3 mb-1">{formatWorkoutDate(workout.createdAt)}</span>
                                      <span className="mr-3 mb-1">
                                        <i className="far fa-clock mr-1"></i> {formatDuration(workout.duration)}
                                      </span>
                                      {workout.distance && (
                                        <span className="mr-3 mb-1">
                                          <i className="fas fa-route mr-1"></i> {(workout.distance / 1000).toFixed(1)} km
                                        </span>
                                      )}
                                      {workout.caloriesBurned && (
                                        <span className="mb-1">
                                          <i className="fas fa-fire mr-1"></i> {workout.caloriesBurned} cal
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    {workout.inProgress ? (
                                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 mr-3">In Progress</span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 mr-3">Not Started</span>
                                    )}
                                    <i className="fas fa-chevron-right text-[#9E9E9E]"></i>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-[#616161]">No active workouts</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Workouts Section */}
          <div>
            <h3 className="text-xl font-semibold text-[#212121] mb-4">Completed Workouts</h3>
            <div className="bg-white shadow rounded-lg">
              {workouts.filter((workout: any) => workout.completed).length > 0 ? (
                <ul className="divide-y divide-[#E0E0E0]">
                  {workouts
                    .filter((workout: any) => workout.completed)
                    .map((workout: any) => (
                      <li key={workout.id}>
                        <Link href={`/workouts/${workout.id}`} className="block hover:bg-[#F5F5F5]">
                          <div className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 h-12 w-12 rounded-full bg-[#81C784] flex items-center justify-center`}>
                                <i className={`fas ${getWorkoutIcon(workout.type)} text-[#4CAF50] text-xl`}></i>
                              </div>
                              <div className="ml-4 flex-grow">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-medium text-[#212121]">{workout.title}</h3>
                                    <div className="flex flex-wrap items-center text-sm text-[#616161] mt-1">
                                      <span className="mr-3 mb-1">{formatWorkoutDate(workout.createdAt)}</span>
                                      <span className="mr-3 mb-1">
                                        <i className="far fa-clock mr-1"></i> {formatDuration(workout.duration)}
                                      </span>
                                      {workout.distance && (
                                        <span className="mr-3 mb-1">
                                          <i className="fas fa-route mr-1"></i> {(workout.distance / 1000).toFixed(1)} km
                                        </span>
                                      )}
                                      {workout.caloriesBurned && (
                                        <span className="mb-1">
                                          <i className="fas fa-fire mr-1"></i> {workout.caloriesBurned} cal
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 mr-3">Completed</span>
                                    <i className="fas fa-chevron-right text-[#9E9E9E]"></i>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-[#616161]">No completed workouts</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg py-10 text-center">
          <div className="h-16 w-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-dumbbell text-[#9E9E9E] text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-[#212121]">No workouts yet</h3>
          <p className="text-[#616161] mt-1">Start tracking your fitness activities</p>
          <Link href="/workouts/new" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C]">
            <PlusCircle className="w-4 h-4 mr-2" /> Add First Workout
          </Link>
        </div>
      )}
    </div>
  );
};

export default Workouts;
