import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// Standard ERC-20 ABI for the functions we need
const ERC20_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  
  // Transaction functions
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  serviceWalletAddress: string;
}

export interface TransferRequest {
  wallet: string;
  amount: string | number;
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

// Get provider and signer (wallet)
const getProviderAndSigner = () => {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.RPC_URL || 'https://rpc-mumbai.maticvigil.com'
  );
  
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('Private key not found in environment variables');
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  return { provider, wallet };
};

// Get token contract instance
const getTokenContract = () => {
  const { wallet } = getProviderAndSigner();
  
  const tokenAddress = process.env.TOKEN_ADDRESS;
  if (!tokenAddress) {
    throw new Error('Token address not found in environment variables');
  }
  
  return new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
};

// Get token information
export const getTokenInfo = async (): Promise<TokenInfo> => {
  try {
    const { wallet } = getProviderAndSigner();
    const tokenContract = getTokenContract();
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.totalSupply()
    ]);
    
    return {
      name,
      symbol,
      decimals,
      totalSupply: ethers.utils.formatUnits(totalSupply, decimals),
      serviceWalletAddress: wallet.address
    };
  } catch (error) {
    console.error('Error getting token info:', error);
    throw error;
  }
};

// Send tokens to a wallet
export const transferTokens = async (request: TransferRequest): Promise<TransferResponse> => {
  try {
    const { wallet, amount } = request;
    
    if (!ethers.utils.isAddress(wallet)) {
      throw new Error('Invalid wallet address');
    }
    
    if (Number(amount) <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    const tokenContract = getTokenContract();
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals);
    
    // Check if the service wallet has enough balance
    const serviceWallet = getProviderAndSigner().wallet;
    const serviceBalance = await tokenContract.balanceOf(serviceWallet.address);
    
    if (serviceBalance.lt(amountInWei)) {
      throw new Error('Insufficient balance in service wallet');
    }
    
    // Send the tokens
    const tx = await tokenContract.transfer(wallet, amountInWei);
    const receipt = await tx.wait();
    
    // Get the new balance of the recipient
    const newBalance = await tokenContract.balanceOf(wallet);
    
    return {
      message: 'Token transfer successful',
      transaction: {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      },
      amount: ethers.utils.formatUnits(amountInWei, decimals),
      recipient: wallet,
      newBalance: ethers.utils.formatUnits(newBalance, decimals)
    };
  } catch (error) {
    console.error('Error transferring tokens:', error);
    throw error;
  }
};

// Format token amount to display with proper decimals
export const formatTokenAmount = (amount: string | number, decimals: number = 18): string => {
  try {
    return ethers.utils.formatUnits(amount.toString(), decimals);
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};

// Check if an address is a valid Ethereum address
export const isValidWalletAddress = (address: string): boolean => {
  return ethers.utils.isAddress(address);
};