import { config } from 'dotenv';
import { ERC20Token } from './erc20';

// Load environment variables
config();

// Check for required environment variables
const requiredEnvVars = ['PRIVATE_KEY', 'RPC_URL', 'TOKEN_ADDRESS'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Blockchain services will not be available until these are configured');
}

// Singleton instance of token service
let tokenInstance: ERC20Token | null = null;

// Initialize token service with environment variables
export const initializeTokenService = (): ERC20Token | null => {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;
    const tokenAddress = process.env.TOKEN_ADDRESS;

    if (!privateKey || !rpcUrl || !tokenAddress) {
      console.warn('Missing blockchain configuration. Token service not initialized.');
      return null;
    }

    tokenInstance = new ERC20Token(tokenAddress, privateKey, rpcUrl);
    return tokenInstance;
  } catch (error) {
    console.error('Failed to initialize token service:', error);
    return null;
  }
};

// Get the token service instance, initializing if needed
export const getTokenService = (): ERC20Token | null => {
  if (!tokenInstance) {
    return initializeTokenService();
  }
  return tokenInstance;
};

// Send tokens to a wallet address
export const sendTokens = async (receiverAddress: string, amount: string) => {
  const tokenService = getTokenService();
  
  if (!tokenService) {
    throw new Error('Token service not initialized. Check your environment configuration.');
  }
  
  try {
    // Validate the wallet address format
    if (!receiverAddress || !receiverAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new Error('Invalid wallet address format');
    }
    
    // Validate the amount (must be a positive number)
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Amount must be a positive number');
    }
    
    // Execute the transfer
    const result = await tokenService.transfer(receiverAddress, amount);
    return result;
  } catch (error) {
    console.error('Error sending tokens:', error);
    throw error;
  }
};

// Get token information
export const getTokenInfo = async () => {
  const tokenService = getTokenService();
  
  if (!tokenService) {
    throw new Error('Token service not initialized. Check your environment configuration.');
  }
  
  try {
    return await tokenService.getTokenInfo();
  } catch (error) {
    console.error('Error getting token info:', error);
    throw error;
  }
};

// Get the wallet address of the service
export const getServiceWalletAddress = (): string | null => {
  const tokenService = getTokenService();
  
  if (!tokenService) {
    return null;
  }
  
  return tokenService.getWalletAddress();
};