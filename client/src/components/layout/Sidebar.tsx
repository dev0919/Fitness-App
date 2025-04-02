import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define User interface for the component
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName?: string;
  profileImage?: string;
}

type NavItemProps = {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
};

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => {
  return (
    <li>
      <Link href={href}>
        <a className={`flex items-center px-4 py-3 ${isActive ? 'text-[#212121] border-l-4 border-[#4CAF50]' : 'text-[#616161] hover:bg-[#F5F5F5] border-l-4 border-transparent'} group`}>
          <i className={`fas ${icon} ${isActive ? 'text-[#4CAF50]' : 'text-[#616161] group-hover:text-[#4CAF50]'} mr-3`}></i>
          <span className={isActive ? 'font-medium' : ''}>{label}</span>
        </a>
      </Link>
    </li>
  );
};

export const Sidebar = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    retry: false,
    throwOnError: false,
  });

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      window.location.href = "/login"; // Force a full refresh to clear all state
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="hidden md:block bg-white w-64 shadow-md h-screen flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-[#4CAF50] font-bold text-2xl">FitConnect</h1>
      </div>
      <div className="py-4 flex-grow">
        <nav>
          <ul>
            <NavItem
              href="/dashboard"
              icon="fa-home"
              label="Dashboard"
              isActive={location === "/dashboard"}
            />
            <NavItem
              href="/workouts"
              icon="fa-dumbbell"
              label="Workouts"
              isActive={location === "/workouts"}
            />
            <NavItem
              href="/challenges"
              icon="fa-trophy"
              label="Challenges"
              isActive={location === "/challenges"}
            />
            <NavItem
              href="/community"
              icon="fa-users"
              label="Community"
              isActive={location === "/community"}
            />
            <NavItem
              href="/profile"
              icon="fa-user"
              label="Profile"
              isActive={location === "/profile"}
            />
            <NavItem
              href="/settings"
              icon="fa-cog"
              label="Settings"
              isActive={location === "/settings"}
            />
          </ul>
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        {user && (
          <div className="flex items-center">
            <img 
              src={user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"} 
              alt="User avatar" 
              className="w-10 h-10 rounded-full object-cover" 
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-[#212121]">{`${user.firstName} ${user.lastName || ''}`}</p>
              <p className="text-xs text-[#9E9E9E]">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50]"
        >
          <i className="fas fa-sign-out-alt mr-2"></i> Logout
        </button>
      </div>
    </aside>
  );
};
