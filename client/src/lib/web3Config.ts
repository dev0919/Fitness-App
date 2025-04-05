// Simple configuration file for Web3 integration

// Alchemy API key for NFT fetching
export const alchemyApiKey = import.meta.env.VITE_ALCHEMY_API_KEY || '';

// Project ID for WalletConnect (you need to get this from cloud.walletconnect.com)
export const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// Define supported chain names (for reference)
export const supportedChains = ['ethereum', 'sepolia'];

// Helper function to format Ethereum addresses
export function formatAddress(address: string | undefined): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Helper function to check if an address is valid
export function isValidAddress(address: string | undefined): boolean {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}