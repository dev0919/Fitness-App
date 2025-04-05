import { useState, useEffect } from 'react';
import { NFTBadge } from '@shared/schema';
import { fetchUserNFTs, filterFitnessNFTs, saveNFTBadgesToUser } from '@/lib/nftService';
import { formatAddress, isValidAddress } from '@/lib/web3Config';
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NFTBadgesProps {
  userId: number;
  walletAddress?: string;
  nftBadges?: NFTBadge[];
  isOwnProfile: boolean;
}

export function NFTBadges({ userId, walletAddress, nftBadges = [], isOwnProfile }: NFTBadgesProps) {
  const { toast } = useToast();
  const [showConnectWallet, setShowConnectWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'fitness'>('fitness');

  // Fetch NFTs from the wallet if available
  const fetchNFTs = async () => {
    if (!walletAddress || !isValidAddress(walletAddress)) {
      setShowConnectWallet(true);
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch all NFTs from the wallet
      const nfts = await fetchUserNFTs(walletAddress);
      
      // Save NFTs to the user profile
      if (nfts.length > 0) {
        await saveNFTBadgesToUser(userId, nfts);
        
        // Update the cached user data
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        
        toast({
          title: "NFT Badges Updated",
          description: `Found ${nfts.length} NFT badges in your wallet.`,
          variant: "default",
        });
      } else {
        toast({
          title: "No NFTs Found",
          description: "No NFTs were found in the connected wallet.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch NFTs. Please check your wallet connection and API keys.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOwnProfile && walletAddress && nftBadges.length === 0) {
      setShowConnectWallet(false);
    }
  }, [isOwnProfile, walletAddress, nftBadges]);

  // Filter badges based on view mode
  const displayedBadges = viewMode === 'fitness' 
    ? filterFitnessNFTs(nftBadges)
    : nftBadges;

  // Handle connect wallet (would be expanded in a real implementation)
  const handleConnectWallet = () => {
    // In a real implementation, this would open a wallet connection modal
    toast({
      title: "Connect Your Wallet",
      description: "This feature requires integration with external wallet providers. Please add your wallet address in your profile settings.",
      variant: "default",
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 bg-gray-200 rounded w-40"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Render no badges state
  if (!walletAddress || displayedBadges.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="h-16 w-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-medal text-[#9E9E9E] text-2xl"></i>
        </div>
        <h3 className="text-lg font-medium text-[#212121]">
          {isOwnProfile ? "No NFT Badges Found" : "This user hasn't connected any NFT badges"}
        </h3>
        <p className="text-[#616161] mt-1">
          {isOwnProfile 
            ? "Connect your crypto wallet to display your NFT badges" 
            : "Badges will appear here when the user connects their wallet"}
        </p>
        
        {isOwnProfile && showConnectWallet && (
          <button 
            onClick={handleConnectWallet}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7C4DFF] hover:bg-[#651FFF] focus:outline-none"
          >
            <i className="fas fa-wallet mr-2"></i>
            Connect Wallet
          </button>
        )}
        
        {isOwnProfile && walletAddress && (
          <button 
            onClick={fetchNFTs}
            disabled={isLoading}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#7C4DFF] hover:bg-[#651FFF] focus:outline-none"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            Refresh NFT Badges
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-[#212121]">
          NFT Badges {displayedBadges.length > 0 && `(${displayedBadges.length})`}
        </h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('fitness')}
            className={`px-3 py-1 text-xs rounded-full ${
              viewMode === 'fitness' 
                ? 'bg-[#7C4DFF] text-white' 
                : 'bg-gray-100 text-[#616161]'
            }`}
          >
            Fitness
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1 text-xs rounded-full ${
              viewMode === 'all' 
                ? 'bg-[#7C4DFF] text-white' 
                : 'bg-gray-100 text-[#616161]'
            }`}
          >
            All
          </button>
          
          {isOwnProfile && (
            <button 
              onClick={fetchNFTs}
              disabled={isLoading}
              className="px-3 py-1 text-xs rounded-full bg-gray-100 text-[#616161] hover:bg-gray-200"
            >
              <i className="fas fa-sync-alt mr-1"></i>
              Refresh
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayedBadges.map((badge) => (
          <div key={badge.id} className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
            <div className="aspect-square w-full overflow-hidden bg-gray-50">
              {badge.image ? (
                <img 
                  src={badge.image} 
                  alt={badge.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/200x200/7C4DFF/ffffff?text=NFT';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#7C4DFF] text-white">
                  <span className="text-xl font-bold">{badge.name.substring(0, 2).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="p-2">
              <div className="text-sm font-medium text-[#212121] truncate" title={badge.name}>
                {badge.name}
              </div>
              <div className="text-xs text-[#9E9E9E] truncate" title={badge.contractAddress}>
                {formatAddress(badge.contractAddress)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}