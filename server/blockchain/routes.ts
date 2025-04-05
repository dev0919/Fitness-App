import express, { Request, Response } from 'express';
import { z } from 'zod';
import { getTokenInfo, transferTokens, isValidWalletAddress } from './erc20';
import type { User } from '../../shared/schema';

const router = express.Router();

// Schema for token transfer requests
const transferTokenSchema = z.object({
  wallet: z.string().refine((val) => isValidWalletAddress(val), {
    message: 'Invalid wallet address',
  }),
  amount: z.union([z.string(), z.number()]).refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: 'Amount must be a positive number',
    }
  ),
});

// Schema for token reward requests
const rewardTokenSchema = z.object({
  userId: z.number(),
  amount: z.union([z.string(), z.number()]).refine(
    (val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: 'Amount must be a positive number',
    }
  ),
  reason: z.string().optional(),
});

// Get token information
router.get('/info', async (req: Request, res: Response) => {
  try {
    const tokenInfo = await getTokenInfo();
    res.json(tokenInfo);
  } catch (error) {
    console.error('Error getting token info:', error);
    res.status(500).json({
      error: 'Failed to get token information',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Reward tokens to a user
router.post('/reward', async (req: Request, res: Response) => {
  try {
    const result = rewardTokenSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: result.error.format(),
      });
    }
    
    const { userId, amount, reason } = result.data;
    
    // Get the user from the database
    const storage = req.app.locals.storage;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }
    
    // Get the user's token wallet
    let wallet = await storage.getTokenWallet(userId);
    
    if (!wallet) {
      // Create a new wallet for the user if they don't have one
      wallet = await storage.createTokenWallet({
        userId,
        balance: '0',
        walletAddress: '',
      });
    }
    
    // Update the user's balance
    const currentBalance = wallet.balance ? parseFloat(wallet.balance) : 0;
    const newBalance = (currentBalance + parseFloat(amount.toString())).toString();
    
    const updatedWallet = await storage.updateTokenWallet(userId, newBalance);
    
    // Record the token transaction
    await storage.createTokenTransaction({
      userId,
      amount: amount.toString(),
      type: 'reward',
      status: 'completed',
      description: reason || 'Token reward',
      metadata: JSON.stringify({
        reason,
        previousBalance: currentBalance.toString(),
        newBalance,
      }),
    });
    
    res.json({
      success: true,
      message: 'Tokens rewarded successfully',
      userId,
      amount,
      reason,
      newBalance,
    });
  } catch (error) {
    console.error('Error rewarding tokens:', error);
    res.status(500).json({
      error: 'Failed to reward tokens',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Transfer tokens to an external wallet
router.post('/transfer', async (req: Request, res: Response) => {
  try {
    const result = transferTokenSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: result.error.format(),
      });
    }
    
    const { wallet, amount } = result.data;
    
    const transferResult = await transferTokens({ wallet, amount });
    
    res.json(transferResult);
  } catch (error) {
    console.error('Error transferring tokens:', error);
    res.status(500).json({
      error: 'Failed to transfer tokens',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;