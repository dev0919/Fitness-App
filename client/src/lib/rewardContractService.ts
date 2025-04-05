import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';
import './web3Config';

// This would be the ABI generated after deploying the contract
// For now, we'll use a minimal ABI with just the functions we need
const RewardStoreABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "productId",
        "type": "string"
      }
    ],
    "name": "ProductBought",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "productId",
        "type": "string"
      }
    ],
    "name": "buyProduct",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// This would be replaced with the actual deployed contract address
const REWARD_STORE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Update after deployment

export class RewardContractService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  
  // Connect to MetaMask
  async connect() {
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask to continue.",
          variant: "destructive"
        });
        return false;
      }
      
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create ethers provider and signer
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = this.provider.getSigner();
      
      // Create contract instance
      this.contract = new ethers.Contract(
        REWARD_STORE_CONTRACT_ADDRESS,
        RewardStoreABI,
        this.signer
      );
      
      return true;
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to MetaMask. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Buy a product using MATIC
  async buyProduct(productId: string, price: string) {
    try {
      if (!this.contract || !this.signer) {
        const connected = await this.connect();
        if (!connected) return false;
      }
      
      // Convert price from MATIC to wei
      const priceInWei = ethers.utils.parseEther(price);
      
      // Call the contract's buyProduct function
      const tx = await this.contract!.buyProduct(productId, {
        value: priceInWei
      });
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      toast({
        title: "Purchase Successful",
        description: `You have successfully purchased the product using MATIC. Transaction hash: ${receipt.transactionHash.slice(0, 10)}...`,
        variant: "default"
      });
      
      return receipt.transactionHash;
    } catch (error) {
      console.error("Error buying product with MATIC:", error);
      toast({
        title: "Purchase Failed",
        description: "There was a problem processing your purchase. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  }
  
  // Get user's connected wallet address
  async getWalletAddress() {
    try {
      if (!this.signer) {
        const connected = await this.connect();
        if (!connected) return null;
      }
      
      return await this.signer!.getAddress();
    } catch (error) {
      console.error("Error getting wallet address:", error);
      return null;
    }
  }
}

// Create a singleton instance
const rewardContractService = new RewardContractService();
export default rewardContractService;