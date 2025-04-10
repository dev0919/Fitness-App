import * as React from "react";
import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  profileImage?: string;
  friendCode?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        console.log("Fetching current user data...");
        const res = await fetch("/api/auth/me", {
          credentials: "include", // Include cookies in the request
          headers: {
            "Accept": "application/json"
          }
        });
        
        if (res.status === 401) {
          console.log("User not authenticated");
          return null;
        }
        
        if (!res.ok) {
          console.error("Failed to fetch user data:", res.status, res.statusText);
          throw new Error("Failed to fetch user data");
        }
        
        const userData = await res.json();
        console.log("User authenticated:", userData);
        return userData;
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error instanceof Error && error.message === "Failed to fetch user data") {
          throw error;
        }
        return null;
      }
    },
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 60000, // 1 minute
  });

  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials) => {
      console.log("Attempting login with:", credentials.username);
      const userData = await apiRequest("POST", "/api/auth/login", credentials);
      return userData; // apiRequest already returns JSON
    },
    onSuccess: (userData) => {
      console.log("Login successful, user data:", userData);
      // Update the cache with the user data
      queryClient.setQueryData(["/api/auth/me"], userData);
      // Refetch to ensure we have the latest data
      refetchUser();
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.firstName}!`,
      });
      
      // Small delay to ensure the client has updated state
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    },
    onError: (error) => {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (userData) => {
      console.log("Attempting registration with:", userData.username);
      const newUser = await apiRequest("POST", "/api/auth/register", userData);
      return newUser; // apiRequest already returns JSON
    },
    onSuccess: (userData) => {
      console.log("Registration successful, user data:", userData);
      // Update the cache with the user data
      queryClient.setQueryData(["/api/auth/me"], userData);
      // Refetch to ensure we have the latest data
      refetchUser();
      
      toast({
        title: "Registration successful",
        description: `Welcome to FitConnect, ${userData.firstName}!`,
      });
      
      // Small delay to ensure the client has updated state
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}