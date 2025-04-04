import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { wakuService, WakuMessage } from "@/lib/wakuService";

// Define types for our context
interface WakuContextType {
  sendMessage: (receiverId: string, content: string) => Promise<boolean>;
  messages: Record<string, WakuMessage[]>;
  connected: boolean;
  connecting: boolean;
  loadChatHistory: (userId: string) => Promise<void>;
}

// Create context
const WakuContext = createContext<WakuContextType | null>(null);

// Message provider component
export const WakuProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState<Record<string, WakuMessage[]>>({});

  // Initialize Waku connection when user is authenticated
  useEffect(() => {
    if (user && !connected && !connecting) {
      const initializeWaku = async () => {
        setConnecting(true);
        try {
          const success = await wakuService.initialize(user.id.toString());
          setConnected(success);
          
          if (success) {
            // Listen for incoming messages
            wakuService.onMessage((message) => {
              setMessages((prevMessages) => {
                // Determine which conversation this belongs to
                const otherUserId = message.sender === user.id.toString() 
                  ? message.receiver 
                  : message.sender;
                
                // Get existing messages for this conversation
                const conversationMessages = prevMessages[otherUserId] || [];
                
                // Check if this message is already in our list
                if (!conversationMessages.find(m => m.id === message.id)) {
                  // Add message to the conversation
                  return {
                    ...prevMessages,
                    [otherUserId]: [...conversationMessages, message]
                  };
                }
                
                return prevMessages;
              });
            });
          } else {
            toast({
              title: "Connection Error",
              description: "Failed to connect to the messaging network. Please try again later.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error initializing Waku:", error);
          toast({
            title: "Connection Error",
            description: "Failed to connect to the messaging network",
            variant: "destructive",
          });
        } finally {
          setConnecting(false);
        }
      };
      
      initializeWaku();
      
      // Cleanup function to stop Waku when component unmounts
      return () => {
        wakuService.stop();
        setConnected(false);
      };
    }
  }, [user, connected, connecting, toast]);

  // Send a message
  const sendMessage = async (receiverId: string, content: string): Promise<boolean> => {
    if (!connected || !user) {
      toast({
        title: "Cannot Send Message",
        description: "You are not connected to the messaging network",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      const success = await wakuService.sendMessage(receiverId, content);
      
      if (!success) {
        toast({
          title: "Message Failed",
          description: "Failed to send your message. Please try again.",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Message Error",
        description: "An error occurred while sending your message",
        variant: "destructive",
      });
      return false;
    }
  };

  // Load existing chat history for a user
  const loadChatHistory = async (userId: string): Promise<void> => {
    // With Waku, we don't need to explicitly load chat history as it will 
    // be retrieved by the Waku store protocol during initialization.
    // The onMessage callback will populate the messages state.
    
    // If we don't have messages for this user yet, initialize with empty array
    setMessages(prev => {
      if (!prev[userId]) {
        return { ...prev, [userId]: [] };
      }
      return prev;
    });
  };

  // Create context value
  const contextValue: WakuContextType = {
    sendMessage,
    messages,
    connected,
    connecting,
    loadChatHistory,
  };

  return (
    <WakuContext.Provider value={contextValue}>
      {children}
    </WakuContext.Provider>
  );
};

// Hook to use the Waku context
export const useWaku = () => {
  const context = useContext(WakuContext);
  if (!context) {
    throw new Error("useWaku must be used within a WakuProvider");
  }
  return context;
};