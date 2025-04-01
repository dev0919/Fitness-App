import { Link } from "wouter";
import { Workout } from "@shared/schema";

type RecentWorkoutsProps = {
  workouts: Workout[];
};

// Helper function to format the date
const formatWorkoutDate = (date: Date): string => {
  const now = new Date();
  const workoutDate = new Date(date);
  
  // Check if it's today
  if (now.toDateString() === workoutDate.toDateString()) {
    return 'Today';
  }
  
  // Check if it's yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === workoutDate.toDateString()) {
    return 'Yesterday';
  }
  
  // Check if it's within the last week
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (workoutDate >= oneWeekAgo) {
    const days = Math.floor((now.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days ago`;
  }
  
  // Otherwise, return the formatted date
  return workoutDate.toLocaleDateString();
};

// Helper function to get workout icon
const getWorkoutIcon = (type: string): { icon: string; bgColor: string; iconColor: string } => {
  switch (type.toLowerCase()) {
    case 'run':
    case 'running':
      return { icon: 'fa-running', bgColor: 'bg-[#81C784]', iconColor: 'text-[#4CAF50]' };
    case 'cycle':
    case 'cycling':
    case 'bike':
      return { icon: 'fa-biking', bgColor: 'bg-[#FF8A65]', iconColor: 'text-[#FF5722]' };
    case 'strength':
    case 'weight':
    case 'weights':
      return { icon: 'fa-dumbbell', bgColor: 'bg-[#64B5F6]', iconColor: 'text-[#2196F3]' };
    case 'swim':
    case 'swimming':
      return { icon: 'fa-swimmer', bgColor: 'bg-[#4FC3F7]', iconColor: 'text-[#03A9F4]' };
    case 'yoga':
      return { icon: 'fa-om', bgColor: 'bg-[#CE93D8]', iconColor: 'text-[#9C27B0]' };
    default:
      return { icon: 'fa-heartbeat', bgColor: 'bg-[#81C784]', iconColor: 'text-[#4CAF50]' };
  }
};

// Helper function to format workout details
const formatWorkoutDetails = (workout: Workout): string => {
  const parts = [];
  
  if (workout.distance) {
    // Convert meters to km
    const km = (workout.distance / 1000).toFixed(1);
    parts.push(`${km} km`);
  }
  
  if (workout.duration) {
    // Format duration
    parts.push(`${workout.duration} min`);
  }
  
  // Add description if it exists and is not too long
  if (workout.description && workout.description.length < 20) {
    parts.push(workout.description);
  }
  
  return parts.join(' • ');
};

export const RecentWorkouts = ({ workouts }: RecentWorkoutsProps) => {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-[#E0E0E0] flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-[#212121]">
            Recent Workouts
          </h3>
          <p className="mt-1 text-sm text-[#616161]">
            Your latest completed workouts
          </p>
        </div>
        <Link href="/workouts">
          <a className="text-sm text-[#4CAF50] hover:text-[#388E3C]">
            View all
          </a>
        </Link>
      </div>
      <div className="bg-white">
        <ul className="divide-y divide-[#E0E0E0]">
          {workouts.length > 0 ? (
            workouts.map((workout) => {
              const { icon, bgColor, iconColor } = getWorkoutIcon(workout.type);
              const workoutDate = new Date(workout.createdAt);
              
              return (
                <li key={workout.id}>
                  <Link href={`/workouts/${workout.id}`}>
                    <a className="block hover:bg-[#F5F5F5]">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full ${bgColor} flex items-center justify-center`}>
                              <i className={`fas ${icon} ${iconColor}`}></i>
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-[#212121]">
                                {workout.title}
                              </p>
                              <p className="text-sm text-[#9E9E9E]">
                                {formatWorkoutDetails(workout)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-[#9E9E9E]">
                              {formatWorkoutDate(workoutDate)}
                            </p>
                            <i className="fas fa-chevron-right ml-2 text-[#9E9E9E]"></i>
                          </div>
                        </div>
                      </div>
                    </a>
                  </Link>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-6 text-center text-[#9E9E9E]">
              No workouts recorded yet. Start tracking your fitness journey!
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
