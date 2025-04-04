import * as React from "react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFriendRequests } from "@/hooks/use-friend-requests";
import { FitConnectLayout } from "@/components/layout/FitConnectLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Users, Search, UserMinus, Loader2, MessageCircle, Bell } from "lucide-react";

export default function FriendsPage() {
  const { toast } = useToast();
  const [friendCode, setFriendCode] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  // Fetch current user data to get friend code
  const {
    data: currentUser,
    isLoading: isLoadingUser,
  } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }
      return res.json();
    },
  });

  // Fetch friends list
  const {
    data: friends,
    isLoading: isLoadingFriends,
    isError: isErrorFriends,
    error: friendsError,
  } = useQuery<User[]>({
    queryKey: ["/api/friends"],
    queryFn: async () => {
      const res = await fetch("/api/friends");
      if (!res.ok) {
        throw new Error("Failed to fetch friends");
      }
      return res.json();
    },
  });

  // Search for a user by friend code
  const {
    data: foundUser,
    isLoading: isSearching,
    isError: isSearchError,
    error: searchError,
    refetch: searchUser,
  } = useQuery<User>({
    queryKey: ["/api/users/find", friendCode],
    queryFn: async () => {
      if (!friendCode) throw new Error("Friend code is required");
      const res = await fetch(`/api/users/find/${friendCode}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("User not found with this friend code");
        }
        throw new Error("Failed to search for user");
      }
      return res.json();
    },
    enabled: searchActive, // Only run the query when search is active
  });

  // Send friend request mutation
  const sendFriendRequestMutation = useMutation({
    mutationFn: async (receiverId: number) => {
      return apiRequest("POST", "/api/friend-requests", { receiverId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Friend request sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friend-requests/pending"] });
      setSearchActive(false);
      setFriendCode("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send friend request",
        variant: "destructive",
      });
    },
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: number) => {
      return apiRequest("DELETE", `/api/friends/remove/${friendId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Friend removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove friend",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCode) {
      toast({
        title: "Error",
        description: "Please enter a friend code",
        variant: "destructive",
      });
      return;
    }
    setSearchActive(true);
    searchUser();
  };

  const handleSendFriendRequest = (friendId: number) => {
    sendFriendRequestMutation.mutate(friendId);
  };

  const handleRemoveFriend = (friendId: number) => {
    removeFriendMutation.mutate(friendId);
  };

  // Get initials for avatar fallback
  const getInitials = (firstName: string, lastName?: string | null) => {
    return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`;
  };

  const [_, navigate] = useLocation();
  const { pendingRequests, isLoadingPendingRequests } = useFriendRequests();
  
  const handleGoToFriendRequests = () => {
    navigate("/friend-requests");
  };
  
  const handleGoToChat = (friendId: number) => {
    navigate(`/chat/${friendId}`);
  };

  return (
    <FitConnectLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold">Friends</h1>
          <div className="flex space-x-3 mt-3 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={handleGoToFriendRequests}
              className="flex items-center"
            >
              <Bell className="h-4 w-4 mr-2" />
              Friend Requests
              {pendingRequests && pendingRequests.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {pendingRequests.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Search for friends */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Find Friends</CardTitle>
              <CardDescription>
                Enter a friend's unique code to connect with them
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  placeholder="Enter friend code (e.g., ABC123)"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </form>
              
              {searchActive && isSearchError && (
                <div className="mt-4 text-red-500 text-sm">
                  {searchError instanceof Error ? searchError.message : "An error occurred"}
                </div>
              )}

              {foundUser && searchActive && (
                <div className="mt-4 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={foundUser.profileImage || undefined} />
                        <AvatarFallback>
                          {getInitials(foundUser.firstName, foundUser.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {foundUser.firstName} {foundUser.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{foundUser.username}
                        </p>
                      </div>
                    </div>
                    {currentUser && friends && friends.some(friend => friend.id === foundUser.id) ? (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleGoToChat(foundUser.id)}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFriend(foundUser.id)}
                          disabled={removeFriendMutation.isPending}
                        >
                          {removeFriendMutation.isPending &&
                            removeFriendMutation.variables === foundUser.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <UserMinus className="h-4 w-4 mr-2" />
                          )}
                          Remove
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => navigate(`/profile/${foundUser.id}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleSendFriendRequest(foundUser.id)}
                        disabled={sendFriendRequestMutation.isPending}
                      >
                        {sendFriendRequestMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        Send Friend Request
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current friends list */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Your Friends</CardTitle>
            </div>
            <CardDescription>
              Manage your connections and keep up with their fitness activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFriends && (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {isErrorFriends && (
              <div className="text-center py-8 text-red-500">
                {friendsError instanceof Error ? friendsError.message : "Failed to load friends"}
              </div>
            )}

            {!isLoadingFriends && !isErrorFriends && friends && friends.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't added any friends yet.</p>
                <p className="text-sm mt-2">
                  Search for friends using their friend code above.
                </p>
              </div>
            )}

            {!isLoadingFriends && !isErrorFriends && friends && friends.length > 0 && (
              <div className="space-y-4">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={friend.profileImage || undefined} />
                        <AvatarFallback>
                          {getInitials(friend.firstName, friend.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {friend.firstName} {friend.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{friend.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleGoToChat(friend.id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFriend(friend.id)}
                        disabled={removeFriendMutation.isPending}
                      >
                        {removeFriendMutation.isPending &&
                          removeFriendMutation.variables === friend.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <UserMinus className="h-4 w-4 mr-2" />
                        )}
                        Remove
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => navigate(`/profile/${friend.id}`)}
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t bg-muted/50 rounded-b-lg">
            <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="p-3 border rounded-md bg-white w-full md:w-auto">
                <p className="text-sm font-medium mb-1 text-center md:text-left">Your Friend Code</p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="font-mono text-lg font-bold bg-[#4CAF50]/10 text-[#4CAF50] py-1 px-2 rounded">{currentUser?.friendCode || "Loading..."}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center md:text-left">Share this code with friends so they can add you</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {friends ? `${friends.length} friend${friends.length !== 1 ? 's' : ''}` : 'Loading...'}
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </FitConnectLayout>
  );
}