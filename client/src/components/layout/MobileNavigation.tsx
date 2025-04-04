import { Link, useLocation } from "wouter";

export const MobileNavigation = () => {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-md md:hidden fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around">
        <Link href="/dashboard">
          <a className={`py-3 px-4 ${location === "/dashboard" ? "text-[#4CAF50] border-t-2 border-[#4CAF50]" : "text-[#9E9E9E] hover:text-[#4CAF50]"} flex flex-col items-center`}>
            <i className="fas fa-home text-lg"></i>
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/workouts">
          <a className={`py-3 px-4 ${location === "/workouts" ? "text-[#4CAF50] border-t-2 border-[#4CAF50]" : "text-[#9E9E9E] hover:text-[#4CAF50]"} flex flex-col items-center`}>
            <i className="fas fa-dumbbell text-lg"></i>
            <span className="text-xs mt-1">Workouts</span>
          </a>
        </Link>
        <Link href="/friends">
          <a className={`py-3 px-4 ${location === "/friends" ? "text-[#4CAF50] border-t-2 border-[#4CAF50]" : "text-[#9E9E9E] hover:text-[#4CAF50]"} flex flex-col items-center`}>
            <i className="fas fa-user-friends text-lg"></i>
            <span className="text-xs mt-1">Friends</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`py-3 px-4 ${location === "/profile" ? "text-[#4CAF50] border-t-2 border-[#4CAF50]" : "text-[#9E9E9E] hover:text-[#4CAF50]"} flex flex-col items-center`}>
            <i className="fas fa-user text-lg"></i>
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
};
