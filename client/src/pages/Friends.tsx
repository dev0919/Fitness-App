import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useFriendRequests } from "@/hooks/use-friend-requests";
import { useAuth } from "@/hooks/use-auth";
import { useWaku } from "@/hooks/use-waku";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Users, Search, UserMinus, Loader2, MessageCircle, Bell, Send } from "lucide-react";

export default function FriendsAndChatPage() {
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

  // Chat functionality
  const { id: chatIdParam } = useParams();
  const { user } = useAuth();
  const { messages, sendMessage, loadChatHistory, connected } = useWaku();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(chatIdParam ? parseInt(chatIdParam) : null);
  const [activeTab, setActiveTab] = useState<'friends' | 'chat'>('friends');
  
  // Fetch friend data for chat
  const { data: selectedFriend, isLoading: isLoadingSelectedFriend } = useQuery({
    queryKey: ['/api/users', selectedFriendId],
    enabled: !!selectedFriendId && selectedFriendId > 0,
  });
  
  // Load chat history when friend changes
  useEffect(() => {
    if (selectedFriendId && selectedFriendId > 0) {
      loadChatHistory(selectedFriendId.toString());
    }
  }, [selectedFriendId, loadChatHistory]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && selectedFriendId) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedFriendId, messages]);
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !selectedFriendId || !connected) return;
    
    setIsSending(true);
    try {
      await sendMessage(selectedFriendId.toString(), messageText);
      setMessageText('');
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };
  
  // Select a chat 
  const selectChat = (id: number) => {
    setSelectedFriendId(id);
    setActiveTab('chat');
  };
  
  // Format timestamp to a readable time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get the current conversation
  const conversation = selectedFriendId && messages ? messages[selectedFriendId] || [] : [];
  
  return (
    <div className="container mx-auto py-8 overflow-x-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 w-full">
          <h1 className="text-3xl font-bold">Friends & Chat</h1>
          <div className="flex space-x-3 mt-3 sm:mt-0">
            <Button 
              variant="outline" 
              onClick={handleGoToFriendRequests}
              className="flex items-center"
            >
              <Bell className="h-4 w-4 mr-2" />
              Friend Requests
              {pendingRequests && Array.isArray(pendingRequests) && pendingRequests.length > 0 ? (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {pendingRequests.length}
                </span>
              ) : null}
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="friends" value={activeTab} onValueChange={(v) => setActiveTab(v as 'friends' | 'chat')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="friends" className="text-base">
              <Users className="mr-2 h-4 w-4" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="chat" className="text-base">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="mt-0">

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
                      <div className="flex flex-wrap gap-2">
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

            {!isLoadingFriends && !isErrorFriends && friends && Array.isArray(friends) && friends.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>You haven't added any friends yet.</p>
                <p className="text-sm mt-2">
                  Search for friends using their friend code above.
                </p>
              </div>
            )}

            {!isLoadingFriends && !isErrorFriends && friends && Array.isArray(friends) && friends.length > 0 && (
              <div className="space-y-4">
                {friends.map((friend: any) => (
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
                    <div className="flex flex-wrap gap-2">
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
                {friends && Array.isArray(friends) ? `${friends.length} friend${friends.length !== 1 ? 's' : ''}` : 'Loading...'}
              </p>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
        
      <TabsContent value="chat" className="mt-0">
        <div className="grid h-[calc(100vh-250px)] grid-cols-1 md:grid-cols-4 gap-4 overflow-hidden">
          {/* Friends sidebar */}
          <Card className="col-span-1 overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Friends</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-350px)]">
              <CardContent className="p-0">
                {isLoadingFriends ? (
                  <div className="flex h-20 items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : !friends || (Array.isArray(friends) && friends.length === 0) ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">
                    No friends yet. Add friends to start chatting.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {Array.isArray(friends) && friends.map((friend: any) => (
                      <button
                        key={friend.id}
                        onClick={() => selectChat(friend.id)}
                        className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-muted transition-colors ${
                          selectedFriendId === friend.id ? 'bg-muted' : ''
                        }`}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={friend.profileImage || ''} alt={friend.username} />
                          <AvatarFallback>
                            {friend.firstName?.[0]}
                            {friend.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{friend.firstName} {friend.lastName}</span>
                          <span className="text-xs text-muted-foreground">@{friend.username}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
          
          {/* Chat area */}
          <Card className="col-span-3 flex flex-col">
            {selectedFriendId && selectedFriend ? (
              <>
                <CardHeader className="border-b p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={(selectedFriend as any).profileImage || ''} alt={(selectedFriend as any).username} />
                      <AvatarFallback>
                        {(selectedFriend as any).firstName?.[0]}
                        {(selectedFriend as any).lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {(selectedFriend as any).firstName} {(selectedFriend as any).lastName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">@{(selectedFriend as any).username}</p>
                    </div>
                  </div>
                </CardHeader>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4 pb-4">
                    {conversation.length === 0 ? (
                      <div className="flex h-40 items-center justify-center text-muted-foreground">
                        No messages yet. Send a message to start the conversation.
                      </div>
                    ) : (
                      conversation.map((message: any) => {
                        const isOutgoing = message.sender === user?.id.toString();
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                isOutgoing
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className={`text-xs mt-1 ${isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                {formatTime(new Date(message.timestamp).toISOString())}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <CardContent className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      disabled={!connected || isSending}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!messageText.trim() || !connected || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                  {!connected && (
                    <p className="mt-2 text-xs text-destructive">
                      Not connected to chat server. Please try refreshing the page.
                    </p>
                  )}
                </CardContent>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <h3 className="mb-2 text-lg font-medium">Select a friend to start chatting</h3>
                <p className="text-muted-foreground">
                  Choose a friend from the list to send encrypted messages securely.
                </p>
              </div>
            )}
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  </div>
  );
}