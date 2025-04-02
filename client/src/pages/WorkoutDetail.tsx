import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Workout } from "@shared/schema";

const WorkoutDetail = () => {
  const { id } = useParams();
  const workoutId = parseInt(id || "0");

  // Fetch workout data
  const { data: workout, isLoading } = useQuery<Workout>({
    queryKey: [`/api/workouts/${workoutId}`],
    enabled: !!workoutId,
  });

  // Helper functions
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes > 0 ? remainingMinutes + ' minutes' : ''}`;
  };

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      run: "Running",
      strength: "Strength Training",
      cycling: "Cycling",
      swimming: "Swimming",
      yoga: "Yoga",
      hiking: "Hiking",
    };
    return types[type.toLowerCase()] || type;
  };

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
    
    const bgColors: Record<string, string> = {
      run: "bg-[#81C784]",
      strength: "bg-[#64B5F6]",
      cycling: "bg-[#FF8A65]",
      swimming: "bg-[#4FC3F7]",
      yoga: "bg-[#CE93D8]",
      hiking: "bg-[#FFD54F]",
      default: "bg-[#81C784]"
    };
    
    const iconColors: Record<string, string> = {
      run: "text-[#4CAF50]",
      strength: "text-[#2196F3]",
      cycling: "text-[#FF5722]",
      swimming: "text-[#03A9F4]",
      yoga: "text-[#9C27B0]",
      hiking: "text-[#FFC107]",
      default: "text-[#4CAF50]"
    };
    
    const key = type.toLowerCase();
    
    return {
      icon: icons[key] || icons.default,
      bgColor: bgColors[key] || bgColors.default,
      iconColor: iconColors[key] || iconColors.default
    };
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="text-center py-10">
          <div className="h-16 w-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-exclamation-triangle text-[#9E9E9E] text-2xl"></i>
          </div>
          <h3 className="text-lg font-medium text-[#212121]">Workout not found</h3>
          <p className="text-[#616161] mt-1 mb-4">The workout you're looking for doesn't exist or has been removed</p>
          <Link href="/workouts" className="text-[#4CAF50] hover:text-[#388E3C]">
            <span className="flex items-center justify-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to workouts
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const { icon, bgColor, iconColor } = getWorkoutIcon(workout.type);

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="mb-6 flex items-center">
        <Link href="/workouts" className="mr-4 text-[#9E9E9E] hover:text-[#212121]">
          <ArrowLeft />
        </Link>
        <h2 className="text-2xl font-bold text-[#212121]">Workout Details</h2>
      </div>

      {/* Workout header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className={`flex-shrink-0 h-16 w-16 rounded-full ${bgColor} flex items-center justify-center`}>
              <i className={`fas ${icon} ${iconColor} text-2xl`}></i>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-medium text-[#212121]">{workout.title}</h3>
              <p className="text-[#616161]">{getTypeLabel(workout.type)}</p>
            </div>
          </div>
          <div className="md:ml-auto flex space-x-2">
            <button className="p-2 text-[#2196F3] hover:bg-[#E3F2FD] rounded-full">
              <Edit className="h-5 w-5" />
            </button>
            <button className="p-2 text-[#F44336] hover:bg-[#FFEBEE] rounded-full">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Workout details */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="border-b border-[#E0E0E0] px-6 py-4">
          <h4 className="text-[#616161] text-sm font-medium">WORKOUT DETAILS</h4>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-[#9E9E9E]">Date</p>
              <p className="text-[#212121] font-medium">{formatDate(workout.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-[#9E9E9E]">Duration</p>
              <p className="text-[#212121] font-medium">{formatDuration(workout.duration)}</p>
            </div>
            {workout.distance && (
              <div>
                <p className="text-sm text-[#9E9E9E]">Distance</p>
                <p className="text-[#212121] font-medium">{(workout.distance / 1000).toFixed(2)} kilometers</p>
              </div>
            )}
            {workout.caloriesBurned && (
              <div>
                <p className="text-sm text-[#9E9E9E]">Calories Burned</p>
                <p className="text-[#212121] font-medium">{workout.caloriesBurned} kcal</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description section */}
      {workout.description && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-[#E0E0E0] px-6 py-4">
            <h4 className="text-[#616161] text-sm font-medium">DESCRIPTION</h4>
          </div>
          <div className="px-6 py-4">
            <p className="text-[#212121] whitespace-pre-line">{workout.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutDetail;