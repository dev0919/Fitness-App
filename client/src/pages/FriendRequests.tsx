import * as React from "react";
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useFriendRequests, FriendRequest } from "@/hooks/use-friend-requests";
import { FitConnectLayout } from "@/components/layout/FitConnectLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, XCircle, UserMinus, MessageCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export default function FriendRequestsPage() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const {
    pendingRequests,
    isLoadingPendingRequests,
    sendRequest,
    isSendingRequest,
    acceptRequest,
    isAcceptingRequest,
    rejectRequest,
    isRejectingRequest,
    findByFriendCode,
    isFindingByFriendCode,
    findByFriendCodeResult,
    findByFriendCodeError,
    resetFindByFriendCodeResult
  } = useFriendRequests();
  
  const [friendCode, setFriendCode] = useState("");
  
  // Fetch friends list
  const {
    data: friends,
    isLoading: isLoadingFriends,
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
  
  const handleFindFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (friendCode.trim()) {
      findByFriendCode(friendCode.trim());
    }
  };
  
  const handleSendRequest = () => {
    if (findByFriendCodeResult) {
      sendRequest(findByFriendCodeResult.id);
      resetFindByFriendCodeResult();
      setFriendCode("");
    }
  };
  
  const handleAcceptRequest = (request: FriendRequest) => {
    acceptRequest(request.id);
  };
  
  const handleRejectRequest = (request: FriendRequest) => {
    rejectRequest(request.id);
  };
  
  const handleGoToFriends = () => {
    navigate("/friends");
  };
  
  const handleGoToChat = (friendId: number) => {
    navigate(`/chat/${friendId}`);
  };
  
  return (
    <FitConnectLayout>
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Friend Requests</h1>
            <Button onClick={handleGoToFriends} variant="outline">
              View Friends
            </Button>
          </div>
          
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="add">Add Friend</TabsTrigger>
              <TabsTrigger value="pending">
                Pending Requests
                {pendingRequests && pendingRequests.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Add a Friend</CardTitle>
                  <CardDescription>
                    Enter a friend code to find and connect with other FitConnect users.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFindFriend} className="flex space-x-2">
                    <Input
                      value={friendCode}
                      onChange={(e) => setFriendCode(e.target.value)}
                      placeholder="Enter friend code (e.g., ALEX1234)"
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={!friendCode.trim() || isFindingByFriendCode}
                    >
                      {isFindingByFriendCode ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Find"
                      )}
                    </Button>
                  </form>
                  
                  {findByFriendCodeError && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        {(findByFriendCodeError as Error).message || "User not found with this friend code"}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {findByFriendCodeResult && (
                    <div className="mt-4">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg">User Found</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-2 pt-0">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage 
                                src={findByFriendCodeResult.profileImage || ""} 
                                alt={findByFriendCodeResult.username} 
                              />
                              <AvatarFallback>
                                {findByFriendCodeResult.firstName?.[0]}
                                {findByFriendCodeResult.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {findByFriendCodeResult.firstName} {findByFriendCodeResult.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                @{findByFriendCodeResult.username}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 pt-0">
                          <Button
                            onClick={() => {
                              resetFindByFriendCodeResult();
                              setFriendCode("");
                            }}
                            variant="outline"
                          >
                            Cancel
                          </Button>
                          
                          {friends && findByFriendCodeResult && friends.some(friend => friend.id === findByFriendCodeResult.id) ? (
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleGoToChat(findByFriendCodeResult.id)}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => navigate(`/profile/${findByFriendCodeResult.id}`)}
                              >
                                View Profile
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={handleSendRequest}
                              disabled={isSendingRequest}
                            >
                              {isSendingRequest ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                "Send Friend Request"
                              )}
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Your Friend Code</CardTitle>
                  <CardDescription>
                    Share this code with friends to let them add you on FitConnect.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center rounded-md bg-muted p-6">
                    <p className="text-2xl font-bold tracking-wider">{user?.friendCode}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Friend Requests</CardTitle>
                  <CardDescription>
                    Accept or reject friend requests from other users.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPendingRequests ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : !pendingRequests || pendingRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground">No pending friend requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <Card key={request.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage 
                                    src={request.sender?.profileImage || ""} 
                                    alt={request.sender?.username} 
                                  />
                                  <AvatarFallback>
                                    {request.sender?.firstName?.[0]}
                                    {request.sender?.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {request.sender?.firstName} {request.sender?.lastName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    @{request.sender?.username}
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleRejectRequest(request)}
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive"
                                  disabled={isRejectingRequest}
                                >
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Reject
                                </Button>
                                <Button
                                  onClick={() => handleAcceptRequest(request)}
                                  size="sm"
                                  disabled={isAcceptingRequest}
                                >
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Accept
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </FitConnectLayout>
  );
}