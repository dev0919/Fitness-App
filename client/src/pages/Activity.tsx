import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const Activity = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week"); // "week", "month", "year"
  
  // Fetch activity data
  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['/api/activities'],
  });

  // Track form state for adding daily activity
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    date: new Date().toISOString().split('T')[0],
    steps: 0,
    caloriesBurned: 0,
    activeMinutes: 0,
    workoutsCompleted: 0
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Activity metrics colors
  const metricColors = {
    steps: 'bg-blue-500',
    calories: 'bg-orange-500',
    active: 'bg-purple-500',
    workouts: 'bg-green-500'
  };

  // Calculate max value for chart scaling
  const getMaxValue = (activities: any[], metric: string) => {
    if (!activities || activities.length === 0) return 100;
    return Math.max(...activities.map(a => a[metric]), 100); // 100 is the minimum to prevent zero-height bars
  };

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
      
      {/* Activity Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activitiesData && activitiesData.length > 0 ? (
          <div className="space-y-8">
            {/* Activity Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#F5F5F5] p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-blue-100 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[#616161]">Average Steps</p>
                    <h4 className="text-lg font-bold text-[#212121]">
                      {Math.round(activitiesData.reduce((acc, curr) => acc + curr.steps, 0) / activitiesData.length).toLocaleString()}
                    </h4>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F5F5F5] p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-orange-100 text-orange-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[#616161]">Avg Calories Burned</p>
                    <h4 className="text-lg font-bold text-[#212121]">
                      {Math.round(activitiesData.reduce((acc, curr) => acc + curr.caloriesBurned, 0) / activitiesData.length).toLocaleString()}
                    </h4>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F5F5F5] p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[#616161]">Avg Active Minutes</p>
                    <h4 className="text-lg font-bold text-[#212121]">
                      {Math.round(activitiesData.reduce((acc, curr) => acc + curr.activeMinutes, 0) / activitiesData.length).toLocaleString()}
                    </h4>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F5F5F5] p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-full bg-green-100 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[#616161]">Total Workouts</p>
                    <h4 className="text-lg font-bold text-[#212121]">
                      {activitiesData.reduce((acc, curr) => acc + curr.workoutsCompleted, 0).toLocaleString()}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Activity Chart */}
            <div>
              <h3 className="text-lg font-medium text-[#212121] mb-4">Activity History</h3>
              <div className="bg-[#F5F5F5] p-4 rounded-lg">
                <div className="flex h-64 items-end space-x-2">
                  {activitiesData.slice(-7).map((activity, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center space-y-1 mb-2">
                        <div 
                          className={`w-full ${metricColors.steps} rounded-t-sm`} 
                          style={{ height: `${(activity.steps / getMaxValue(activitiesData, 'steps')) * 100}%` }}
                          title={`${activity.steps} steps`}
                        ></div>
                        <div 
                          className={`w-full ${metricColors.calories} rounded-t-sm`} 
                          style={{ height: `${(activity.caloriesBurned / getMaxValue(activitiesData, 'caloriesBurned')) * 100}%` }}
                          title={`${activity.caloriesBurned} calories`}
                        ></div>
                        <div 
                          className={`w-full ${metricColors.active} rounded-t-sm`} 
                          style={{ height: `${(activity.activeMinutes / getMaxValue(activitiesData, 'activeMinutes')) * 100}%` }}
                          title={`${activity.activeMinutes} minutes`}
                        ></div>
                        <div 
                          className={`w-full ${metricColors.workouts} rounded-t-sm`} 
                          style={{ height: `${(activity.workoutsCompleted / getMaxValue(activitiesData, 'workoutsCompleted')) * 100}%` }}
                          title={`${activity.workoutsCompleted} workouts`}
                        ></div>
                      </div>
                      <div className="text-xs text-[#616161] mt-1">
                        {formatDate(activity.date)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mt-4 space-x-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${metricColors.steps} rounded-sm mr-1`}></div>
                    <span className="text-xs text-[#616161]">Steps</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${metricColors.calories} rounded-sm mr-1`}></div>
                    <span className="text-xs text-[#616161]">Calories</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${metricColors.active} rounded-sm mr-1`}></div>
                    <span className="text-xs text-[#616161]">Active Min</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${metricColors.workouts} rounded-sm mr-1`}></div>
                    <span className="text-xs text-[#616161]">Workouts</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Add Activity Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowActivityForm(!showActivityForm)}
                className="px-4 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#388E3C] flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {showActivityForm ? 'Cancel' : 'Log Daily Activity'}
              </button>
            </div>
            
            {/* Activity Form */}
            {showActivityForm && (
              <div className="border border-[#E0E0E0] rounded-lg p-4 mt-4">
                <h3 className="text-lg font-medium text-[#212121] mb-4">Log Daily Activity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#616161] mb-1">Date</label>
                    <input
                      type="date"
                      value={newActivity.date}
                      onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                      className="w-full p-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#616161] mb-1">Steps</label>
                    <input
                      type="number"
                      value={newActivity.steps}
                      onChange={(e) => setNewActivity({...newActivity, steps: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#616161] mb-1">Calories Burned</label>
                    <input
                      type="number"
                      value={newActivity.caloriesBurned}
                      onChange={(e) => setNewActivity({...newActivity, caloriesBurned: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#616161] mb-1">Active Minutes</label>
                    <input
                      type="number"
                      value={newActivity.activeMinutes}
                      onChange={(e) => setNewActivity({...newActivity, activeMinutes: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#616161] mb-1">Workouts Completed</label>
                    <input
                      type="number"
                      value={newActivity.workoutsCompleted}
                      onChange={(e) => setNewActivity({...newActivity, workoutsCompleted: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    className="px-4 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#388E3C]"
                    onClick={() => {
                      // Here you would submit the activity
                      console.log('Submitting activity:', newActivity);
                      // Close form after submission
                      setShowActivityForm(false);
                    }}
                  >
                    Save Activity
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="h-16 w-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#9E9E9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[#212121]">No activity data yet</h3>
            <p className="text-[#616161] mt-1 mb-4">Start tracking your daily fitness activity</p>
            <button
              onClick={() => setShowActivityForm(!showActivityForm)}
              className="px-4 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#388E3C]"
            >
              Add First Activity
            </button>
            
            {/* Activity Form for empty state */}
            {showActivityForm && (
              <div className="border border-[#E0E0E0] rounded-lg p-4 mt-6 max-w-lg mx-auto">
                <h3 className="text-lg font-medium text-[#212121] mb-4">Log Daily Activity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-[#616161] mb-1">Date</label>
                    <input
                      type="date"
                      value={newActivity.date}
                      onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                      className="w-full p-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#616161] mb-1">Steps</label>
                    <input
                      type="number"
                      value={newActivity.steps}
                      onChange={(e) => setNewActivity({...newActivity, steps: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#616161] mb-1">Calories Burned</label>
                    <input
                      type="number"
                      value={newActivity.caloriesBurned}
                      onChange={(e) => setNewActivity({...newActivity, caloriesBurned: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#616161] mb-1">Active Minutes</label>
                    <input
                      type="number"
                      value={newActivity.activeMinutes}
                      onChange={(e) => setNewActivity({...newActivity, activeMinutes: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#616161] mb-1">Workouts Completed</label>
                    <input
                      type="number"
                      value={newActivity.workoutsCompleted}
                      onChange={(e) => setNewActivity({...newActivity, workoutsCompleted: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-[#E0E0E0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#4CAF50]"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    className="px-4 py-2 bg-[#4CAF50] text-white rounded-md hover:bg-[#388E3C]"
                    onClick={() => {
                      // Here you would submit the activity
                      console.log('Submitting activity:', newActivity);
                      // Close form after submission
                      setShowActivityForm(false);
                    }}
                  >
                    Save Activity
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activity;
