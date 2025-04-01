import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const Activity = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week"); // "week", "month", "year"
  
  // Fetch activity data
  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['/api/activities'],
  });

  if (isLoading) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 md:px-8">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#212121]">Activity Tracker</h2>
          <p className="text-[#616161] mt-1">Monitor your fitness journey</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button 
            onClick={() => setSelectedPeriod("week")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedPeriod === "week" 
                ? "bg-[#4CAF50] text-white" 
                : "bg-white text-[#616161] border border-[#E0E0E0]"
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => setSelectedPeriod("month")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedPeriod === "month" 
                ? "bg-[#4CAF50] text-white" 
                : "bg-white text-[#616161] border border-[#E0E0E0]"
            }`}
          >
            Month
          </button>
          <button 
            onClick={() => setSelectedPeriod("year")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedPeriod === "year" 
                ? "bg-[#4CAF50] text-white" 
                : "bg-white text-[#616161] border border-[#E0E0E0]"
            }`}
          >
            Year
          </button>
        </div>
      </div>
      
      {/* Activity Content - To be implemented with actual data from API */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-10">
          <h3 className="text-xl font-medium text-[#616161]">Activity page is under construction</h3>
          <p className="mt-2 text-[#9E9E9E]">Check back soon for detailed activity tracking!</p>
        </div>
      </div>
    </div>
  );
};

export default Activity;
