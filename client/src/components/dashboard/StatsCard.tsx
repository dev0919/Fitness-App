import { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  progress?: number;
  goalText?: string;
  children?: ReactNode;
};

export const StatsCard = ({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor,
  progress,
  goalText,
  children
}: StatsCardProps) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            <i className={`fas ${icon} ${iconColor} text-xl`}></i>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-[#9E9E9E] truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-[#212121]">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
        
        {(progress !== undefined && goalText) && (
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-[#E0E0E0]">
                <div 
                  style={{ width: `${progress}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#4CAF50]"
                ></div>
              </div>
            </div>
            <div className="text-sm text-[#616161] mt-1">
              {goalText}
            </div>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

// Streak days variant
export const StreakCard = ({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  iconColor,
  days
}: {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  days: { day: string; completed: boolean }[];
}) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${iconBgColor} rounded-md p-3`}>
            <i className={`fas ${icon} ${iconColor} text-xl`}></i>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-[#9E9E9E] truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-[#212121]">
                  {value}
                </div>
              </dd>
            </dl>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          {days.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="text-xs text-[#9E9E9E]">{day.day}</div>
              <div className={`h-6 w-6 rounded-full ${day.completed ? 'bg-[#4CAF50]' : 'bg-[#E0E0E0]'} flex items-center justify-center mt-1`}>
                {day.completed ? (
                  <i className="fas fa-check text-white text-xs"></i>
                ) : (
                  <span className="text-xs text-[#9E9E9E]">-</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
