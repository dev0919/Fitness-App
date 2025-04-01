import { Activity } from "@shared/schema";

type ActivityChartProps = {
  weeklyActivities: Activity[];
};

// Helper function to format day
const formatDay = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

// Helper function to calculate height percentage based on activity
const calculateHeight = (activity: Activity, maxValue: number): string => {
  if (maxValue === 0) return '0%';
  
  // Use a combination of steps and active minutes to determine the height
  const activityScore = activity.steps * 0.7 + activity.activeMinutes * 30;
  const percentage = Math.max(Math.min((activityScore / maxValue) * 100, 100), 5);
  
  return `${percentage}%`;
};

export const ActivityChart = ({ weeklyActivities }: ActivityChartProps) => {
  // Find the maximum activity value for scaling
  const maxValue = weeklyActivities.reduce((max, activity) => {
    const activityScore = activity.steps * 0.7 + activity.activeMinutes * 30;
    return Math.max(max, activityScore);
  }, 0);

  return (
    <div className="w-full h-full flex items-end justify-between">
      {weeklyActivities.map((activity, index) => {
        const date = new Date(activity.date);
        const isToday = new Date().toDateString() === date.toDateString();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        
        return (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div 
              className={`w-12 ${isToday ? 'bg-[#4CAF50]' : isWeekend ? 'bg-[#81C784]' : 'bg-[#4CAF50]'} rounded-t`} 
              style={{ height: calculateHeight(activity, maxValue) }}
            ></div>
            <div className="text-xs text-[#9E9E9E]">{formatDay(date)}</div>
          </div>
        );
      })}
    </div>
  );
};
