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
import FriendRequests from "@/pages/FriendRequests";
import Chat from "@/pages/Chat";
import Tokens from "@/pages/Tokens";
import Rewards from "@/pages/Rewards";
import { FitConnectLayout } from "@/components/layout/FitConnectLayout";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { WakuProvider } from "@/hooks/use-waku";

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
  "/friends",
  "/chat",
  "/tokens",
  "/rewards"
];

function Router() {
  const [_, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/login">
        {user ? <Dashboard /> : <Login />}
      </Route>
      
      <Route path="/register">
        {user ? <Dashboard /> : <Register />}
      </Route>
      
      {/* Protected routes */}
      <Route path="/dashboard">
        {user ? (
          <FitConnectLayout>
            <Dashboard />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/workouts/new">
        {user ? (
          <FitConnectLayout>
            <NewWorkout />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/workouts/:id">
        {user ? (
          <FitConnectLayout>
            <WorkoutDetail />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/workouts">
        {user ? (
          <FitConnectLayout>
            <Workouts />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/challenges/new">
        {user ? (
          <FitConnectLayout>
            <NewChallenge />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/challenges/:id">
        {user ? (
          <FitConnectLayout>
            <ChallengeDetail />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/challenges">
        {user ? (
          <FitConnectLayout>
            <Challenges />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/community">
        {user ? (
          <FitConnectLayout>
            <Community />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/profile/:id">
        {user ? (
          <FitConnectLayout>
            <Profile />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/profile">
        {user ? (
          <FitConnectLayout>
            <Profile />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/edit-profile">
        {user ? (
          <FitConnectLayout>
            <EditProfile />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/settings">
        {user ? (
          <FitConnectLayout>
            <Settings />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/friends">
        {user ? (
          <FitConnectLayout>
            <Friends />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/friend-requests">
        {user ? (
          <FitConnectLayout>
            <FriendRequests />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/chat/:id">
        {user ? (
          <FitConnectLayout>
            <Chat />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/chat">
        {user ? (
          <FitConnectLayout>
            <Chat />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/tokens">
        {user ? (
          <FitConnectLayout>
            <Tokens />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/rewards">
        {user ? (
          <FitConnectLayout>
            <Rewards />
          </FitConnectLayout>
        ) : <Login />}
      </Route>
      
      <Route path="/">
        {user ? (
          <FitConnectLayout>
            <Dashboard />
          </FitConnectLayout>
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
      <AuthProvider>
        <WakuProvider>
          <Router />
          <Toaster />
        </WakuProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
