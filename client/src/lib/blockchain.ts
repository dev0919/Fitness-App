import { apiRequest } from "@/lib/queryClient";

// Types for blockchain operations
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  serviceWalletAddress: string;
}

export interface TransferRequest {
  wallet: string;
  amount: string;
}

export interface TransferResponse {
  message: string;
  transaction: {
    success: boolean;
    transactionHash: string;
    blockNumber: number;
  };
  amount: string;
  recipient: string;
  newBalance?: string;
}

// Fetch token information (name, symbol, decimals, etc.)
export async function getTokenInfo(): Promise<TokenInfo> {
  return apiRequest("GET", '/api/blockchain/info');
}

// Transfer tokens from user's app wallet to an external blockchain wallet
export async function transferTokens(request: TransferRequest): Promise<TransferResponse> {
  return apiRequest("POST", '/api/blockchain/transfer', request);
}

// Validate wallet address format
export function isValidWalletAddress(address: string): boolean {
  // Simple validation for an Ethereum-style address
  return Boolean(address && address.match(/^0x[a-fA-F0-9]{40}$/));
}

// Format token amount for display
export function formatTokenAmount(amount: string | number, decimals: number = 0): string {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return '0';
    
    // Return the formatted number with commas and up to 'decimals' decimal places
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    }).format(numAmount);
  } catch (e) {
    console.error('Error formatting token amount:', e);
    return amount.toString();
  }
}

// Truncate wallet address for display
export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}