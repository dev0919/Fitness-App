import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWaku } from "@/hooks/use-waku";
import { WakuMessage } from "@/lib/wakuService";
import { FitConnectLayout } from "@/components/layout/FitConnectLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";

export default function ChatPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { messages, sendMessage, loadChatHistory, connected } = useWaku();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const friendId = parseInt(id || "0");
  
  // Fetch friend data
  const { data: friend, isLoading: isLoadingFriend } = useQuery({
    queryKey: ['/api/users', friendId],
    enabled: !!friendId && friendId > 0,
  });
  
  // Fetch friends list for the sidebar
  const { data: friends, isLoading: isLoadingFriends } = useQuery({
    queryKey: ['/api/friends'],
  });
  
  // Load chat history when friend changes
  useEffect(() => {
    if (friendId && friendId > 0) {
      loadChatHistory(friendId.toString());
    }
  }, [friendId, loadChatHistory]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages[friendId]]);
  
  // With Waku, we don't need to mark messages as read
  // as we're not tracking read status in this implementation
  
  // Handle sending a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !friendId || !connected) return;
    
    setIsSending(true);
    try {
      await sendMessage(friendId.toString(), messageText);
      setMessageText('');
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };
  
  // Select a chat from the sidebar
  const selectChat = (id: number) => {
    navigate(`/chat/${id}`);
  };
  
  // Format timestamp to a readable time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get the current conversation
  const conversation = friendId ? messages[friendId] || [] : [];
  
  // Show loading if friend is being loaded
  if (isLoadingFriend && friendId) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto h-full max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      
      <div className="grid h-[calc(100vh-220px)] grid-cols-4 gap-4">
        {/* Friends sidebar */}
        <Card className="col-span-1 overflow-hidden">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Friends</CardTitle>
          </CardHeader>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <CardContent className="p-0">
              {isLoadingFriends ? (
                <div className="flex h-20 items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : !friends || friends.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  No friends yet. Add friends to start chatting.
                </div>
              ) : (
                <div className="space-y-1">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => selectChat(friend.id)}
                      className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-muted transition-colors ${
                        friendId === friend.id ? 'bg-muted' : ''
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
          {friendId && friend ? (
            <>
              <CardHeader className="border-b p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.profileImage || ''} alt={friend.username} />
                    <AvatarFallback>
                      {friend.firstName?.[0]}
                      {friend.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {friend.firstName} {friend.lastName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
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
                    conversation.map((message) => {
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
      </div>
  );
}