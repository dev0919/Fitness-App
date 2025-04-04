/**
 * Utility functions for end-to-end encryption in chat messaging
 */

// Generate an RSA key pair for the user
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]), // 65537
      hash: "SHA-256",
    },
    true, // exportable
    ["encrypt", "decrypt"]
  );
}

// Generate a random AES key for symmetric encryption of a message
export async function generateMessageKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // exportable
    ["encrypt", "decrypt"]
  );
}

// Export a key to base64 format
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey(
    key.type === "private" ? "pkcs8" : "spki",
    key
  );
  return arrayBufferToBase64(exported);
}

// Import a public key from base64 format
export async function importPublicKey(base64Key: string): Promise<CryptoKey> {
  const binaryKey = base64ToArrayBuffer(base64Key);
  return window.crypto.subtle.importKey(
    "spki",
    binaryKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

// Import a private key from base64 format
export async function importPrivateKey(base64Key: string): Promise<CryptoKey> {
  const binaryKey = base64ToArrayBuffer(base64Key);
  return window.crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

// Import an AES key from base64 format
export async function importAesKey(base64Key: string): Promise<CryptoKey> {
  const binaryKey = base64ToArrayBuffer(base64Key);
  return window.crypto.subtle.importKey(
    "raw",
    binaryKey,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Generate a random IV for AES encryption
export function generateIV(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

// Encrypt a message with AES-GCM
export async function encryptMessage(
  message: string,
  key: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  return window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    data
  );
}

// Decrypt a message with AES-GCM
export async function decryptMessage(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    key,
    encryptedData
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Encrypt an AES key with the recipient's public RSA key
export async function encryptKey(
  aesKey: CryptoKey,
  publicKey: CryptoKey
): Promise<ArrayBuffer> {
  const exportedKey = await window.crypto.subtle.exportKey("raw", aesKey);
  return window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    exportedKey
  );
}

// Decrypt an AES key with the user's private RSA key
export async function decryptKey(
  encryptedKey: ArrayBuffer,
  privateKey: CryptoKey
): Promise<CryptoKey> {
  const decryptedKey = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedKey
  );
  
  return window.crypto.subtle.importKey(
    "raw",
    decryptedKey,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Helper functions for converting between ArrayBuffer and Base64
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}