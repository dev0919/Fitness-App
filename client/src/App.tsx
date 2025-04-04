import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Workouts from "@/pages/Workouts";
import WorkoutDetail from "@/pages/WorkoutDetail";
import NewWorkout from "@/pages/NewWorkout";
import Challenges from "@/pages/Challenges";
import NewChallenge from "@/pages/NewChallenge";
import ChallengeDetail from "@/pages/ChallengeDetail";
import Community from "@/pages/Community";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import Settings from "@/pages/Settings";
import Friends from "@/pages/Friends";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { AppLayout } from "@/layouts/AppLayout";
import { useEffect, useState } from "react";
import { apiRequest } from "./lib/queryClient";

// Define authenticated routes that require login
const authenticatedRoutes = [
  "/dashboard",
  "/workouts",
  "/workouts/new",
  "/challenges",
  "/community",
  "/profile",
  "/edit-profile",
  "/settings",
  "/friends"
];

function Router() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await apiRequest("GET", "/api/auth/me");
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        
        // Redirect to login if user tries to access protected route
        if (authenticatedRoutes.some(route => location.startsWith(route))) {
          setLocation("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [location, setLocation]);

  // Handle redirects for authenticated users
  useEffect(() => {
    if (isAuthenticated && (location === "/login" || location === "/register" || location === "/")) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, location, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected routes */}
      <Route path="/dashboard">
        {isAuthenticated ? (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/workouts/new">
        {isAuthenticated ? (
          <AppLayout>
            <NewWorkout />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/workouts/:id">
        {isAuthenticated ? (
          <AppLayout>
            <WorkoutDetail />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/workouts">
        {isAuthenticated ? (
          <AppLayout>
            <Workouts />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/challenges/new">
        {isAuthenticated ? (
          <AppLayout>
            <NewChallenge />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/challenges/:id">
        {isAuthenticated ? (
          <AppLayout>
            <ChallengeDetail />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/challenges">
        {isAuthenticated ? (
          <AppLayout>
            <Challenges />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/community">
        {isAuthenticated ? (
          <AppLayout>
            <Community />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/profile/:id">
        {isAuthenticated ? (
          <AppLayout>
            <Profile />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/profile">
        {isAuthenticated ? (
          <AppLayout>
            <Profile />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/edit-profile">
        {isAuthenticated ? (
          <AppLayout>
            <EditProfile />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/settings">
        {isAuthenticated ? (
          <AppLayout>
            <Settings />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/friends">
        {isAuthenticated ? (
          <AppLayout>
            <Friends />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/">
        {isAuthenticated ? (
          <AppLayout>
            <Dashboard />
          </AppLayout>
        ) : <Login />}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
