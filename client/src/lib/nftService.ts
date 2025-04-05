import { Alchemy, Network } from '@alch/alchemy-sdk';
import { NFTBadge } from '@shared/schema';
import { alchemyApiKey } from './web3Config';

// Initialize Alchemy SDK
const alchemy = new Alchemy({
  apiKey: alchemyApiKey,
  network: Network.ETH_MAINNET, // Using mainnet but you can change to other networks
});

/**
 * Fetches NFTs for a given wallet address
 * @param walletAddress Ethereum wallet address to fetch NFTs for
 * @returns Array of NFTBadge objects
 */
export async function fetchUserNFTs(walletAddress: string): Promise<NFTBadge[]> {
  if (!walletAddress || !alchemyApiKey) {
    console.error('Wallet address or Alchemy API key is missing');
    return [];
  }

  try {
    // Fetch NFTs owned by the address
    const response = await alchemy.nft.getNftsForOwner(walletAddress);
    
    // Map the response to our NFTBadge format
    const nftBadges: NFTBadge[] = response.ownedNfts.map((nft: any) => {
      // Try to parse media
      let imageUrl = '';
      if (nft.media && nft.media.length > 0 && nft.media[0].gateway) {
        imageUrl = nft.media[0].gateway;
      } else if (nft.tokenUri?.gateway) {
        imageUrl = nft.tokenUri.gateway;
      }

      // Map to our NFTBadge type
      return {
        id: nft.tokenId,
        contractAddress: nft.contract.address,
        name: nft.title || 'Unnamed NFT',
        description: nft.description || '',
        image: imageUrl,
        tokenType: nft.tokenType || 'ERC721',
        category: 'general' // Default category
      };
    });

    return nftBadges;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}

/**
 * Filters NFTs to show only fitness-related or achievement-related NFTs
 * This is a simple implementation - in production you'd have a more robust way to categorize NFTs
 * @param nfts Array of NFTBadge objects
 * @returns Filtered array of NFTBadge objects
 */
export function filterFitnessNFTs(nfts: NFTBadge[]): NFTBadge[] {
  // Keywords that might indicate fitness-related NFTs
  const fitnessKeywords = [
    'fitness', 'workout', 'gym', 'run', 'running', 'exercise', 
    'health', 'training', 'achievement', 'sport', 'athletic',
    'medal', 'badge', 'award', 'trophy', 'challenge', 'fitconnect'
  ];
  
  return nfts.filter(nft => {
    const nameAndDescription = `${nft.name.toLowerCase()} ${(nft.description || '').toLowerCase()}`;
    
    // Check if any fitness keywords appear in the name or description
    return fitnessKeywords.some(keyword => nameAndDescription.includes(keyword));
  }).map(nft => ({
    ...nft,
    category: 'fitness' // Tag these as fitness NFTs
  }));
}

/**
 * Updates a user's NFT badges in the backend
 * @param userId User ID
 * @param nftBadges Array of NFTBadge objects
 */
export async function saveNFTBadgesToUser(userId: number, nftBadges: NFTBadge[]): Promise<void> {
  try {
    await fetch(`/api/users/${userId}/nftbadges`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nftBadges }),
    });
  } catch (error) {
    console.error('Error saving NFT badges:', error);
  }
}