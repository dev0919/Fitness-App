import * as React from "react";
import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "./use-toast";
import * as crypto from "@/lib/cryptoUtils";

// Message types
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  encryptedContent: string;
  encryptedKey: string;
  iv: string;
  createdAt: string;
  isRead: boolean;
}

interface DecryptedMessage extends Omit<Message, "encryptedContent"> {
  content: string;
}

interface WebSocketContextType {
  sendMessage: (receiverId: number, message: string) => Promise<void>;
  messages: Record<number, DecryptedMessage[]>;
  connected: boolean;
  connecting: boolean;
  keyPair: CryptoKeyPair | null;
  publicKeyString: string | null;
  loadChatHistory: (userId: number) => Promise<void>;
  markAsRead: (messageId: number) => Promise<void>;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState<Record<number, DecryptedMessage[]>>({});
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);
  const [publicKeyString, setPublicKeyString] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Get the session ID from cookies
  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    
    const sessionCookie = cookies['connect.sid'];
    if (sessionCookie) {
      setSessionId(sessionCookie);
    }
  }, []);

  // Generate or retrieve key pair
  useEffect(() => {
    const loadOrGenerateKeyPair = async () => {
      try {
        // Check if we have keys in localStorage
        const storedPrivateKey = localStorage.getItem('chatPrivateKey');
        const storedPublicKey = localStorage.getItem('chatPublicKey');

        if (storedPrivateKey && storedPublicKey) {
          // Import the stored keys
          const privateKey = await crypto.importPrivateKey(storedPrivateKey);
          const publicKey = await crypto.importPublicKey(storedPublicKey);
          
          setKeyPair({ privateKey, publicKey });
          setPublicKeyString(storedPublicKey);
        } else {
          // Generate new keys
          const newKeyPair = await crypto.generateKeyPair();
          setKeyPair(newKeyPair);
          
          // Export and store the keys
          const privateKeyString = await crypto.exportKey(newKeyPair.privateKey);
          const publicKeyString = await crypto.exportKey(newKeyPair.publicKey);
          
          localStorage.setItem('chatPrivateKey', privateKeyString);
          localStorage.setItem('chatPublicKey', publicKeyString);
          
          setPublicKeyString(publicKeyString);
        }
      } catch (error) {
        console.error('Error with cryptographic keys:', error);
        toast({
          title: "Cryptography Error",
          description: "There was an error with the encryption keys. Chat functionality may be limited.",
          variant: "destructive",
        });
      }
    };

    loadOrGenerateKeyPair();
  }, [toast]);

  // Connect to WebSocket when authenticated
  useEffect(() => {
    if (user && sessionId && !wsRef.current && !connecting) {
      setConnecting(true);
      
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws?sessionID=${sessionId}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        setConnected(true);
        setConnecting(false);
        console.log("WebSocket connected");
      };
      
      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connected') {
            console.log("WebSocket connection confirmed, user ID:", data.userId);
          } 
          else if (data.type === 'message') {
            if (!keyPair) {
              console.error("No keypair available to decrypt message");
              return;
            }
            
            const message = data.message as Message;
            
            try {
              // Decrypt the message
              const encryptedKey = crypto.base64ToArrayBuffer(message.encryptedKey);
              const messageKey = await crypto.decryptKey(encryptedKey, keyPair.privateKey);
              
              const iv = new Uint8Array(crypto.base64ToArrayBuffer(message.iv));
              const encryptedContent = crypto.base64ToArrayBuffer(message.encryptedContent);
              
              const decryptedContent = await crypto.decryptMessage(encryptedContent, messageKey, iv);
              
              const decryptedMessage: DecryptedMessage = {
                ...message,
                content: decryptedContent
              };
              
              // Update messages state
              setMessages(prevMessages => {
                const senderId = message.senderId;
                const userMessages = prevMessages[senderId] || [];
                return {
                  ...prevMessages,
                  [senderId]: [...userMessages, decryptedMessage]
                };
              });
              
              // Notify user of new message
              toast({
                title: "New Message",
                description: `You received a new message`,
                variant: "default",
              });
            } catch (error) {
              console.error("Error decrypting message:", error);
            }
          }
          else if (data.type === 'error') {
            console.error("WebSocket error:", data.error);
            toast({
              title: "Error",
              description: data.error,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnected(false);
        setConnecting(false);
        toast({
          title: "Connection Error",
          description: "There was an error with the chat connection. Please try again.",
          variant: "destructive",
        });
      };
      
      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;
      };
      
      return () => {
        ws.close();
        wsRef.current = null;
      };
    }
  }, [user, sessionId, connecting, toast, keyPair]);

  // Load chat history for a specific user
  const loadChatHistory = async (userId: number) => {
    if (!user || !keyPair) return;
    
    try {
      const response = await fetch(`/api/messages/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }
      
      const chatHistory = await response.json() as Message[];
      
      // Decrypt all messages
      const decryptedMessages: DecryptedMessage[] = await Promise.all(
        chatHistory.map(async (message) => {
          try {
            const encryptedKey = crypto.base64ToArrayBuffer(message.encryptedKey);
            const messageKey = await crypto.decryptKey(encryptedKey, keyPair.privateKey);
            
            const iv = new Uint8Array(crypto.base64ToArrayBuffer(message.iv));
            const encryptedContent = crypto.base64ToArrayBuffer(message.encryptedContent);
            
            const decryptedContent = await crypto.decryptMessage(encryptedContent, messageKey, iv);
            
            return {
              ...message,
              content: decryptedContent
            };
          } catch (error) {
            console.error("Error decrypting message:", error);
            return {
              ...message,
              content: "[Decryption error]"
            };
          }
        })
      );
      
      // Update messages state
      setMessages(prevMessages => ({
        ...prevMessages,
        [userId]: decryptedMessages
      }));
    } catch (error) {
      console.error("Error loading chat history:", error);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    }
  };

  // Mark a message as read
  const markAsRead = async (messageId: number) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }
      
      // Update the message in the state
      setMessages(prevMessages => {
        const updatedMessages = { ...prevMessages };
        
        // Find the conversation containing this message
        Object.keys(updatedMessages).forEach(userId => {
          const userIdNum = parseInt(userId);
          const messageIndex = updatedMessages[userIdNum].findIndex(m => m.id === messageId);
          
          if (messageIndex >= 0) {
            // Update the message
            updatedMessages[userIdNum] = [
              ...updatedMessages[userIdNum].slice(0, messageIndex),
              { ...updatedMessages[userIdNum][messageIndex], isRead: true },
              ...updatedMessages[userIdNum].slice(messageIndex + 1)
            ];
          }
        });
        
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // Send a message to another user
  const sendMessage = async (receiverId: number, message: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !user || !keyPair || !publicKeyString) {
      throw new Error("WebSocket is not connected or user is not authenticated");
    }

    try {
      // Generate a random AES key for this message
      const messageKey = await crypto.generateMessageKey();
      
      // Generate a random IV
      const iv = crypto.generateIV();
      const ivString = crypto.arrayBufferToBase64(iv.buffer);
      
      // Encrypt the message content
      const encryptedContent = await crypto.encryptMessage(message, messageKey, iv);
      const encryptedContentString = crypto.arrayBufferToBase64(encryptedContent);
      
      // Encrypt the message key with the recipient's public key
      // In a real app, you would fetch the recipient's public key from the server
      // For now, we'll use our own public key just for demonstration
      const encryptedKey = await crypto.encryptKey(messageKey, keyPair.publicKey);
      const encryptedKeyString = crypto.arrayBufferToBase64(encryptedKey);
      
      // Send the encrypted message through the WebSocket
      wsRef.current.send(JSON.stringify({
        type: 'message',
        receiverId,
        content: {
          encryptedContent: encryptedContentString,
          encryptedKey: encryptedKeyString,
          iv: ivString
        },
        publicKey: publicKeyString
      }));
      
      // Add the sent message to our state (client-side optimistic update)
      const sentMessage: DecryptedMessage = {
        id: -Date.now(), // Temporary negative ID until we get the real one from the server
        senderId: user.id,
        receiverId,
        encryptedContent: encryptedContentString,
        encryptedKey: encryptedKeyString,
        iv: ivString,
        createdAt: new Date().toISOString(),
        isRead: false,
        content: message
      };
      
      setMessages(prevMessages => {
        const userMessages = prevMessages[receiverId] || [];
        return {
          ...prevMessages,
          [receiverId]: [...userMessages, sentMessage]
        };
      });
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      throw error;
    }
  };

  const contextValue: WebSocketContextType = {
    sendMessage,
    messages,
    connected,
    connecting,
    keyPair,
    publicKeyString,
    loadChatHistory,
    markAsRead
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};