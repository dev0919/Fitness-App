import { Activity } from "@shared/schema";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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
  const [chartType, setChartType] = useState<'steps' | 'calories' | 'active'>('steps');
  const [animatedActivities, setAnimatedActivities] = useState<Activity[]>([]);
  
  // When activities change, animate them in one by one
  useEffect(() => {
    setAnimatedActivities([]);
    
    const timer = setTimeout(() => {
      weeklyActivities.forEach((activity, index) => {
        setTimeout(() => {
          setAnimatedActivities(prev => [...prev, activity]);
        }, index * 100); // Stagger the animation
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [weeklyActivities]);

  // Find the maximum activity value for scaling based on selected chart type
  const maxValue = weeklyActivities.reduce((max, activity) => {
    let value;
    switch (chartType) {
      case 'steps':
        value = activity.steps;
        break;
      case 'calories':
        value = activity.caloriesBurned;
        break;
      case 'active':
        value = activity.activeMinutes;
        break;
      default:
        value = activity.steps;
    }
    return Math.max(max, value);
  }, 0);

  // Get the value for a specific metric
  const getMetricValue = (activity: Activity): number => {
    switch (chartType) {
      case 'steps':
        return activity.steps;
      case 'calories':
        return activity.caloriesBurned;
      case 'active':
        return activity.activeMinutes;
      default:
        return activity.steps;
    }
  };

  // Get the height percentage for visualization
  const getBarHeight = (activity: Activity): string => {
    if (maxValue === 0) return '0%';
    const value = getMetricValue(activity);
    const percentage = Math.max(Math.min((value / maxValue) * 100, 100), 5);
    return `${percentage}%`;
  };

  // Get color based on value compared to goal
  const getBarColor = (activity: Activity): string => {
    const value = getMetricValue(activity);
    const date = new Date(activity.date);
    const isToday = new Date().toDateString() === date.toDateString();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Define color based on how close to goal
    let goalPercentage;
    switch (chartType) {
      case 'steps':
        goalPercentage = value / 10000; // Assuming 10k steps goal
        break;
      case 'calories':
        goalPercentage = value / 500; // Assuming 500 cal goal
        break;
      case 'active':
        goalPercentage = value / 60; // Assuming 60 min goal
        break;
      default:
        goalPercentage = 0.5;
    }
    
    if (isToday) return 'bg-[#4CAF50]';
    if (goalPercentage >= 1) return 'bg-[#4CAF50]';
    if (goalPercentage >= 0.7) return 'bg-[#8BC34A]';
    if (goalPercentage >= 0.4) return 'bg-[#FFC107]';
    return 'bg-[#FF9800]';
  };

  // Get the label for the selected metric
  const getMetricLabel = (): string => {
    switch (chartType) {
      case 'steps':
        return 'Steps';
      case 'calories':
        return 'Calories';
      case 'active':
        return 'Active Minutes';
      default:
        return 'Activity';
    }
  };

  return (
    <div className="w-full h-full">
      <Tabs defaultValue="steps" className="mb-4">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="steps" onClick={() => setChartType('steps')}>Steps</TabsTrigger>
          <TabsTrigger value="calories" onClick={() => setChartType('calories')}>Calories</TabsTrigger>
          <TabsTrigger value="active" onClick={() => setChartType('active')}>Active Time</TabsTrigger>
        </TabsList>
        
        <TabsContent value="steps" className="mt-0">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Daily Step Count</span>
            <span className="text-xs text-muted-foreground">Goal: 10,000 steps per day</span>
          </div>
        </TabsContent>
        <TabsContent value="calories" className="mt-0">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Calories Burned</span>
            <span className="text-xs text-muted-foreground">Goal: 500 calories per day</span>
          </div>
        </TabsContent>
        <TabsContent value="active" className="mt-0">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Active Minutes</span>
            <span className="text-xs text-muted-foreground">Goal: 60 minutes per day</span>
          </div>
        </TabsContent>
      </Tabs>

      <div className="w-full h-60 flex items-end justify-between relative pt-6 pl-6 pr-6">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-between text-xs text-[#9E9E9E]">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
        
        {/* Grid lines */}
        <div className="absolute inset-0 pt-6 pl-6 pr-6 flex flex-col justify-between pointer-events-none">
          <div className="border-t border-dashed border-[#E0E0E0] w-full h-0"></div>
          <div className="border-t border-dashed border-[#E0E0E0] w-full h-0"></div>
          <div className="border-t border-dashed border-[#E0E0E0] w-full h-0"></div>
          <div className="border-t border-dashed border-[#E0E0E0] w-full h-0"></div>
        </div>
        
        {/* Bars */}
        <div className="w-full h-full flex items-end justify-between relative">
          {animatedActivities.map((activity, index) => {
            const date = new Date(activity.date);
            const value = getMetricValue(activity);
            
            return (
              <div key={index} className="flex flex-col items-center space-y-2 group">
                <div 
                  className={`w-12 ${getBarColor(activity)} rounded-t transition-all duration-500 ease-out overflow-hidden relative`} 
                  style={{ 
                    height: getBarHeight(activity),
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  {/* Value tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black text-white text-xs px-2 py-1 rounded transition-opacity pointer-events-none">
                    {value.toLocaleString()}
                  </div>
                </div>
                <div className="text-xs text-[#9E9E9E]">{formatDay(date)}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 pt-2 border-t text-xs text-center text-muted-foreground">
        Showing {getMetricLabel()} for the past week
      </div>
    </div>
  );
};
