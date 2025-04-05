// Define the Ethereum object type for the window
declare global {
  interface Window {
    ethereum: any;
  }
}

// Alchemy API key - replace with your actual key
export const alchemyApiKey = "demo";

// Format an Ethereum address for display (truncate middle)
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Check if a string is a valid Ethereum address
export const isValidAddress = (address: string): boolean => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};