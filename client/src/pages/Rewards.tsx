import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { formatDistance } from 'date-fns';
import rewardContractService from '@/lib/rewardContractService';
import {
  ChevronRight,
  Trophy,
  ShieldCheck,
  Coins,
  Gift,
  AlertCircle,
  Wallet,
  Package,
  ShoppingBag,
  History,
  LogOut,
  Award
} from 'lucide-react';

// Interface types
interface RewardProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
  category: 'digital' | 'physical' | 'badge';
}

interface Transaction {
  id: number;
  type: string;
  description: string;
  amount: string;
  status: string;
  createdAt: string;
  txHash?: string | null;
}

interface Purchase {
  id: number;
  itemId: number;
  name: string;
  quantity: number;
  totalPrice: string;
  status: string;
  createdAt: string;
  redemptionCode?: string | null;
}

interface Wallet {
  balance: string;
  walletAddress: string | null;
}

// Mock reward products with MATIC prices
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
  const [activeTab, setActiveTab] = useState("wallet");
  const [storeTab, setStoreTab] = useState("badge");
  
  // Fetch wallet data
  const { data: walletData } = useQuery<Wallet>({
    queryKey: ['/api/wallet'],
    enabled: activeTab === "wallet" || activeTab === "store",
  });
  
  // Fetch transaction history
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: activeTab === "wallet" || activeTab === "history",
  });
  
  // Fetch purchases
  const { data: purchases } = useQuery<Purchase[]>({
    queryKey: ['/api/purchases'],
    enabled: activeTab === "purchases",
  });

  // Check wallet connection on component mount
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
        
        toast({
          title: "Wallet Connected",
          description: "Your crypto wallet is now connected.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to your wallet. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
      variant: "default"
    });
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
          <h1 className="text-3xl font-bold mb-2">Rewards & Marketplace</h1>
          <p className="text-muted-foreground">
            Earn FitCoins through activities, connect your crypto wallet, and purchase exclusive rewards.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="wallet">
              <Coins className="w-4 h-4 mr-2" />
              FitCoins
            </TabsTrigger>
            <TabsTrigger value="store">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Reward Store
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Transaction History
            </TabsTrigger>
            <TabsTrigger value="purchases">
              <Package className="w-4 h-4 mr-2" />
              Your Purchases
            </TabsTrigger>
          </TabsList>
          
          {/* FitCoins Tab */}
          <TabsContent value="wallet" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Coins className="mr-2 h-5 w-5" />
                    Your FitCoins Balance
                  </CardTitle>
                  <CardDescription>
                    Earn coins through workouts, challenges, and social interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-4xl font-bold text-green-500 mb-2">
                      {walletData?.balance || "0"} <span className="text-base text-gray-500">FitCoins</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Complete fitness activities to earn more coins!
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Recent Transactions</h3>
                    {transactions && transactions.length > 0 ? (
                      <div className="space-y-2">
                        {transactions.slice(0, 3).map(tx => (
                          <div key={tx.id} className="flex items-center justify-between border-b pb-2">
                            <div>
                              <p className="font-medium">{tx.description}</p>
                              <p className="text-xs text-gray-500">
                                {formatDistance(new Date(tx.createdAt), new Date(), { addSuffix: true })}
                              </p>
                            </div>
                            <div className={`font-medium ${tx.amount.startsWith('-') ? 'text-red-500' : 'text-green-500'}`}>
                              {tx.amount.startsWith('-') ? '' : '+'}{tx.amount} FC
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No transactions yet</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveTab("history")}>
                    View All Transactions
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="mr-2 h-5 w-5" />
                    Crypto Wallet
                  </CardTitle>
                  <CardDescription>
                    Connect your crypto wallet to purchase premium rewards with MATIC
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!walletConnected ? (
                    <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center">
                      <Wallet className="h-16 w-16 text-gray-400 mb-4" />
                      <p className="text-center mb-4">
                        Connect your wallet to purchase premium rewards with cryptocurrency
                      </p>
                      <Button onClick={connectWallet} className="w-full">
                        Connect Wallet
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-medium">Connected Wallet</p>
                          <p className="text-sm text-gray-500 font-mono">
                            {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                          </p>
                        </div>
                        <ShieldCheck className="h-8 w-8 text-green-500" />
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={disconnectWallet}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Disconnect Wallet
                      </Button>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="default" className="w-full" onClick={() => setActiveTab("store")}>
                    Visit Reward Store
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          {/* Reward Store Tab */}
          <TabsContent value="store" className="w-full">
            {!walletConnected && (
              <Alert variant="destructive" className="mb-6">
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
              <Alert className="mb-6 bg-green-50 border-green-200">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Wallet Connected</AlertTitle>
                <AlertDescription>
                  Your wallet is connected: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="ml-4"
                    onClick={disconnectWallet}
                  >
                    <LogOut className="mr-2 h-3 w-3" /> Disconnect
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs value={storeTab} onValueChange={setStoreTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="badge">
                  <Award className="w-4 h-4 mr-2" />
                  Badges
                </TabsTrigger>
                <TabsTrigger value="digital">
                  <Gift className="w-4 h-4 mr-2" />
                  Digital Products
                </TabsTrigger>
                <TabsTrigger value="physical">
                  <Package className="w-4 h-4 mr-2" />
                  Physical Products
                </TabsTrigger>
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
          </TabsContent>
          
          {/* Transaction History Tab */}
          <TabsContent value="history" className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="mr-2 h-5 w-5" />
                  Transaction History
                </CardTitle>
                <CardDescription>
                  View your complete history of FitCoin earnings and expenditures
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Description</th>
                          <th className="text-left pb-2">Type</th>
                          <th className="text-left pb-2">Amount</th>
                          <th className="text-left pb-2">Date</th>
                          <th className="text-left pb-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(tx => (
                          <tr key={tx.id} className="border-b">
                            <td className="py-3">{tx.description}</td>
                            <td className="py-3 capitalize">{tx.type}</td>
                            <td className={`py-3 ${tx.amount.startsWith('-') ? 'text-red-500' : 'text-green-500'} font-medium`}>
                              {tx.amount.startsWith('-') ? '' : '+'}{tx.amount} FC
                            </td>
                            <td className="py-3 text-sm text-gray-500">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                tx.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No transaction history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Your Purchases Tab */}
          <TabsContent value="purchases" className="w-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Your Purchases
                </CardTitle>
                <CardDescription>
                  View all your purchased items and their delivery status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {purchases && purchases.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left pb-2">Item</th>
                          <th className="text-left pb-2">Price</th>
                          <th className="text-left pb-2">Quantity</th>
                          <th className="text-left pb-2">Date</th>
                          <th className="text-left pb-2">Status</th>
                          <th className="text-left pb-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchases.map(purchase => (
                          <tr key={purchase.id} className="border-b">
                            <td className="py-3 font-medium">{purchase.name}</td>
                            <td className="py-3">{purchase.totalPrice} FC</td>
                            <td className="py-3">{purchase.quantity}</td>
                            <td className="py-3 text-sm text-gray-500">
                              {new Date(purchase.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                purchase.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                purchase.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                                purchase.status === 'shipped' ? 'bg-purple-100 text-purple-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {purchase.status}
                              </span>
                            </td>
                            <td className="py-3">
                              {purchase.redemptionCode && (
                                <Button variant="outline" size="sm">
                                  View Code
                                </Button>
                              )}
                              {purchase.status === 'shipped' && (
                                <Button variant="outline" size="sm">
                                  Track
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">You haven't made any purchases yet</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("store")}
                    >
                      Visit Reward Store
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Rewards;