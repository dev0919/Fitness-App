import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Menu, X } from "lucide-react";

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
  onClick?: () => void;
};

const NavItem = ({ href, icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <Link href={href}>
      <a 
        className={`flex items-center px-4 py-2 ${isActive ? 'text-[#4CAF50] font-medium' : 'text-[#616161] hover:text-[#4CAF50]'}`}
        onClick={onClick}
      >
        <i className={`fas ${icon} ${isActive ? 'text-[#4CAF50]' : 'text-[#616161]'} mr-2`}></i>
        <span>{label}</span>
      </a>
    </Link>
  );
};

export const TopNavbar = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-[#4CAF50] font-bold text-xl">FitConnect</h1>
            </div>
            {/* Desktop menu */}
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
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
                href="/friends"
                icon="fa-user-friends"
                label="Friends"
                isActive={location === "/friends"}
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
            </div>
          </div>
          
          {/* Profile dropdown */}
          <div className="hidden md:ml-4 md:flex md:items-center">
            {user && (
              <div className="flex items-center">
                <img 
                  src={user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"} 
                  alt="User avatar" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <div className="ml-2 mr-4">
                  <p className="text-sm font-medium text-[#212121]">{`${user.firstName} ${user.lastName || ''}`}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50]"
                >
                  <i className="fas fa-sign-out-alt mr-1"></i> Logout
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#616161] hover:text-[#4CAF50] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4CAF50]"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state. */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <NavItem
              href="/dashboard"
              icon="fa-home"
              label="Dashboard"
              isActive={location === "/dashboard"}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/workouts"
              icon="fa-dumbbell"
              label="Workouts"
              isActive={location === "/workouts"}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/challenges"
              icon="fa-trophy"
              label="Challenges"
              isActive={location === "/challenges"}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/community"
              icon="fa-users"
              label="Community"
              isActive={location === "/community"}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/friends"
              icon="fa-user-friends"
              label="Friends"
              isActive={location === "/friends"}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/profile"
              icon="fa-user"
              label="Profile"
              isActive={location === "/profile"}
              onClick={closeMobileMenu}
            />
            <NavItem
              href="/settings"
              icon="fa-cog"
              label="Settings"
              isActive={location === "/settings"}
              onClick={closeMobileMenu}
            />
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user && (
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={user.profileImage || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80"}
                    alt={`${user.firstName} ${user.lastName || ''}`}
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-[#212121]">{`${user.firstName} ${user.lastName || ''}`}</div>
                  <div className="text-sm font-medium text-[#616161]">{user.email}</div>
                </div>
              </div>
              
            )}
            <div className="mt-3 px-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4CAF50] hover:bg-[#388E3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50]"
              >
                <i className="fas fa-sign-out-alt mr-2"></i> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};