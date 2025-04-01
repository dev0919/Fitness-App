import { useState } from "react";
import { useLocation } from "wouter";

export const Header = () => {
  const [location] = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const openNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowSearch(false);
  };

  const openSearch = () => {
    setShowSearch(!showSearch);
    setShowNotifications(false);
  };

  return (
    <header className="bg-[#4CAF50] py-4 px-4 shadow-md md:hidden">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-white font-medium text-xl">FitConnect</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={openNotifications} className="text-white relative">
            <i className="fas fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 bg-[#FF5722] text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
          </button>
          <button onClick={openSearch} className="text-white">
            <i className="fas fa-search text-lg"></i>
          </button>
        </div>
      </div>
      
      {showNotifications && (
        <div className="absolute top-14 right-4 w-64 bg-white rounded-md shadow-lg z-20">
          <div className="p-2 border-b">
            <h3 className="font-medium">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-auto">
            <div className="p-3 border-b hover:bg-gray-50">
              <p className="text-sm">Sarah commented on your workout</p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
            <div className="p-3 border-b hover:bg-gray-50">
              <p className="text-sm">New challenge available: "Summer Running"</p>
              <p className="text-xs text-gray-500 mt-1">1 day ago</p>
            </div>
            <div className="p-3 hover:bg-gray-50">
              <p className="text-sm">You achieved a new personal record!</p>
              <p className="text-xs text-gray-500 mt-1">2 days ago</p>
            </div>
          </div>
        </div>
      )}
      
      {showSearch && (
        <div className="absolute top-14 left-0 right-0 bg-white p-4 shadow-md z-20">
          <input
            type="text"
            placeholder="Search workouts, friends..."
            className="w-full p-2 border rounded-md"
          />
        </div>
      )}
    </header>
  );
};
