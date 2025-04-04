import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: number;
    username: string;
    firstName: string;
    lastName?: string;
    profileImage?: string;
    friendCode: string;
  };
}

export function useFriendRequests() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch pending friend requests
  const {
    data: pendingRequests,
    isLoading: isLoadingPendingRequests,
    error: pendingRequestsError,
    refetch: refetchPendingRequests
  } = useQuery({
    queryKey: ['/api/friend-requests/pending'],
    enabled: !!user,
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (receiverId: number) => {
      return await apiRequest("POST", "/api/friend-requests", { receiverId });
    },
    onSuccess: () => {
      toast({
        title: "Friend request sent",
        description: "Your friend request has been sent successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send friend request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Accept friend request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest("PATCH", `/api/friend-requests/${requestId}`, { status: "accepted" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends'] });
      toast({
        title: "Friend request accepted",
        description: "You are now friends with this user",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to accept friend request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject friend request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      return await apiRequest("PATCH", `/api/friend-requests/${requestId}`, { status: "rejected" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friend-requests/pending'] });
      toast({
        title: "Friend request rejected",
        description: "The friend request has been rejected",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject friend request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to find a user by friend code
  const findByFriendCodeMutation = useMutation({
    mutationFn: async (friendCode: string) => {
      return await apiRequest("GET", `/api/users/find/${friendCode}`);
    },
  });

  return {
    pendingRequests,
    isLoadingPendingRequests,
    pendingRequestsError,
    refetchPendingRequests,
    sendRequest: sendRequestMutation.mutate,
    isSendingRequest: sendRequestMutation.isPending,
    acceptRequest: acceptRequestMutation.mutate,
    isAcceptingRequest: acceptRequestMutation.isPending,
    rejectRequest: rejectRequestMutation.mutate,
    isRejectingRequest: rejectRequestMutation.isPending,
    findByFriendCode: findByFriendCodeMutation.mutate,
    isFindingByFriendCode: findByFriendCodeMutation.isPending,
    findByFriendCodeResult: findByFriendCodeMutation.data,
    findByFriendCodeError: findByFriendCodeMutation.error,
    resetFindByFriendCodeResult: () => findByFriendCodeMutation.reset(),
  };
}