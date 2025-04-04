import {
  createLightNode,
  waitForRemotePeer,
  createDecoder,
  createEncoder,
  Protocols,
  DecodedMessage,
  bytesToUtf8,
  utf8ToBytes
} from "@waku/sdk";
import { type LightNode } from "@waku/interfaces";
import { generateSymmetricKey } from "@waku/message-encryption";

export interface WakuMessage {
  id: string;
  timestamp: number;
  sender: string;
  receiver: string;
  content: string;
}

const CONTENT_TOPIC = "/fitconnect/1/chat/proto";
const MESSAGE_ENCRYPTION_KEY = "fitconnect-messages-key";

class WakuService {
  private node: LightNode | null = null;
  private encoder: any = null;
  private decoder: any = null;
  private messageCallbacks: Array<(message: WakuMessage) => void> = [];
  private symmetricKeyEncryption: any = null;
  private initialized = false;
  private userId: string | null = null;

  async initialize(userId: string): Promise<boolean> {
    if (this.initialized) return true;
    
    try {
      // Store user ID
      this.userId = userId;
      
      // Create and start a light node
      this.node = await createLightNode({ defaultBootstrap: true });
      await this.node.start();
      
      // Wait for connection to peers
      await waitForRemotePeer(this.node, [Protocols.Store, Protocols.Filter, Protocols.LightPush]);
      
      // Create a content topic encoder and decoder
      this.encoder = createEncoder({ contentTopic: CONTENT_TOPIC });
      this.decoder = createDecoder(CONTENT_TOPIC);
      
      // Skip message encryption for now
      this.symmetricKeyEncryption = null;
      
      // Subscribe to messages for this content topic
      await this.subscribeToMessages();
      
      this.initialized = true;
      console.log("Waku service initialized");
      return true;
    } catch (error) {
      console.error("Failed to initialize Waku:", error);
      return false;
    }
  }

  // Subscribe to messages in our content topic
  private async subscribeToMessages() {
    if (!this.node) return;
    
    try {
      // Process existing messages from the store protocol
      const storeCallback = (wakuMessage: DecodedMessage) => {
        if (wakuMessage.payload) {
          const messageObj = this.decodeMessage(wakuMessage.payload);
          if (messageObj) {
            this.notifyListeners(messageObj);
          }
        }
      };
      
      await this.node.filter.subscribe([this.decoder], storeCallback);
      
      // Query the store for any existing messages
      await this.node.store.queryWithOrderedCallback(
        [this.decoder],
        storeCallback,
        { pageSize: 25 }
      );
      
      console.log("Retrieved stored messages");
    } catch (error) {
      console.error("Error subscribing to messages:", error);
    }
  }

  // Send a message to another user
  async sendMessage(receiverId: string, content: string): Promise<boolean> {
    if (!this.node || !this.encoder || !this.userId) {
      console.error("Waku not initialized");
      return false;
    }
    
    try {
      // Create message object
      const messageObj: WakuMessage = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        timestamp: Date.now(),
        sender: this.userId,
        receiver: receiverId,
        content
      };
      
      // Serialize and encrypt the message
      const serialized = JSON.stringify(messageObj);
      const payload = utf8ToBytes(serialized);
      
      // Only encrypt if we have the encryption key
      const encryptedPayload = this.symmetricKeyEncryption 
        ? await this.symmetricKeyEncryption.encrypt(payload)
        : payload;
      
      // Send the message
      await this.node.lightPush.send(this.encoder, { payload: encryptedPayload });
      
      // Notify our own listeners about the sent message
      this.notifyListeners(messageObj);
      
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  // Decode a message from bytes
  private decodeMessage(payload: Uint8Array): WakuMessage | null {
    try {
      // Decrypt the payload if encrypted
      const decryptedPayload = this.symmetricKeyEncryption 
        ? this.symmetricKeyEncryption.decrypt(payload)
        : payload;
      
      // Convert bytes to string and parse JSON
      const messageString = bytesToUtf8(decryptedPayload);
      return JSON.parse(messageString) as WakuMessage;
    } catch (error) {
      console.error("Error decoding message:", error);
      return null;
    }
  }

  // Add a callback for new messages
  onMessage(callback: (message: WakuMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  // Notify all listeners of a new message
  private notifyListeners(message: WakuMessage) {
    // Only notify for messages intended for this user or sent by this user
    if (this.userId && (message.receiver === this.userId || message.sender === this.userId)) {
      this.messageCallbacks.forEach(callback => callback(message));
    }
  }

  // Stop the Waku node
  async stop() {
    if (this.node) {
      await this.node.stop();
      this.node = null;
      this.initialized = false;
      console.log("Waku service stopped");
    }
  }
}

// Export a singleton instance
export const wakuService = new WakuService();