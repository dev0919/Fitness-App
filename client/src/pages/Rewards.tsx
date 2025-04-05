import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import rewardContractService from '@/lib/rewardContractService';
import {
  ChevronRight,
  Trophy,
  ShieldCheck,
  Crown,
  Gift,
  AlertCircle,
  Wallet
} from 'lucide-react';

interface RewardProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: 'digital' | 'physical' | 'badge';
}

const rewardProducts: RewardProduct[] = [
  {
    id: 'premium-badge-1',
    name: 'Premium Trophy Badge',
    description: 'Show off your dedication with this exclusive digital trophy',
    price: '0.01',
    image: '🏆',
    category: 'badge'
  },
  {
    id: 'elite-badge-1',
    name: 'Elite Fitness Badge',
    description: 'Elite status badge visible on your profile',
    price: '0.02',
    image: '💪',
    category: 'badge'
  },
  {
    id: 'workout-plan-1',
    name: 'Exclusive HIIT Workout Plan',
    description: 'Get access to our premium 12-week HIIT workout program',
    price: '0.05',
    image: '📱',
    category: 'digital'
  },
  {
    id: 'nutrition-plan-1',
    name: 'Custom Nutrition Plan',
    description: 'Digital nutrition guide tailored to your fitness goals',
    price: '0.03',
    image: '🥗',
    category: 'digital'
  },
  {
    id: 'fitness-shirt-1',
    name: 'FitConnect Athletic Shirt',
    description: 'Premium workout shirt with FitConnect logo (shipping included)',
    price: '0.1',
    image: '👕',
    category: 'physical'
  },
  {
    id: 'water-bottle-1',
    name: 'Smart Water Bottle',
    description: 'Track your hydration with our smart water bottle',
    price: '0.08',
    image: '🍶',
    category: 'physical'
  }
];

const Rewards = () => {
  const { toast } = useToast();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  
  // Connect wallet on component mount
  useEffect(() => {
    checkWalletConnection();
  }, []);
  
  const checkWalletConnection = async () => {
    try {
      const address = await rewardContractService.getWalletAddress();
      if (address) {
        setWalletAddress(address);
        setWalletConnected(true);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };
  
  const connectWallet = async () => {
    try {
      const connected = await rewardContractService.connect();
      if (connected) {
        const address = await rewardContractService.getWalletAddress();
        setWalletAddress(address);
        setWalletConnected(true);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };
  
  const handlePurchase = async (product: RewardProduct) => {
    if (!walletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to purchase this product.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setPurchaseInProgress(true);
      const txHash = await rewardContractService.buyProduct(product.id, product.price);
      
      if (txHash) {
        toast({
          title: "Purchase Successful!",
          description: `You purchased ${product.name}. It will be delivered soon!`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error processing purchase:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPurchaseInProgress(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col items-start gap-6">
        <div className="w-full">
          <h1 className="text-3xl font-bold mb-2">Fitness Rewards</h1>
          <p className="text-muted-foreground">
            Earn rewards with your fitness achievements. Purchase exclusive digital items with MATIC.
          </p>
        </div>
        
        {!walletConnected && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Wallet Not Connected</AlertTitle>
            <AlertDescription>
              Connect your MetaMask wallet to purchase rewards using MATIC.
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={connectWallet}
              >
                <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {walletConnected && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Wallet Connected</AlertTitle>
            <AlertDescription>
              Your wallet is connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="digital" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="badge">Badges</TabsTrigger>
            <TabsTrigger value="digital">Digital Products</TabsTrigger>
            <TabsTrigger value="physical">Physical Products</TabsTrigger>
          </TabsList>
          
          {(['badge', 'digital', 'physical'] as const).map(category => (
            <TabsContent key={category} value={category} className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewardProducts
                  .filter(product => product.category === category)
                  .map(product => (
                    <Card key={product.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl">{product.name}</CardTitle>
                          <div className="text-3xl">{product.image}</div>
                        </div>
                        <CardDescription>{product.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-lg font-semibold">
                          {product.price} MATIC
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => handlePurchase(product)}
                          disabled={!walletConnected || purchaseInProgress}
                        >
                          {purchaseInProgress ? "Processing..." : "Purchase"} 
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                }
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Rewards;