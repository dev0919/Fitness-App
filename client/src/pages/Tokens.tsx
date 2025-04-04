import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Coins, ArrowUpRight, Wallet, ShoppingCart, Clock, Check } from "lucide-react";

const Tokens = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [walletAddress, setWalletAddress] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Query wallet data
  const {
    data: wallet,
    isLoading: isWalletLoading,
    error: walletError,
  } = useQuery({
    queryKey: ["/api/wallet"],
    enabled: !!user,
  });

  // Query transaction history
  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  // Query reward store items
  const {
    data: storeItems,
    isLoading: isStoreLoading,
    error: storeError,
  } = useQuery({
    queryKey: ["/api/store"],
    enabled: !!user,
  });

  // Query user purchases
  const {
    data: purchases,
    isLoading: isPurchasesLoading,
    error: purchasesError,
  } = useQuery({
    queryKey: ["/api/purchases"],
    enabled: !!user,
  });

  // Mutation to connect external wallet
  const connectWalletMutation = useMutation({
    mutationFn: (address: string) => {
      return fetch("/api/wallet/address", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ walletAddress: address }),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to connect wallet");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected.",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to connect wallet: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to purchase item from store
  const purchaseItemMutation = useMutation({
    mutationFn: (itemId: number) => {
      return fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          itemId,
          quantity: 1,
        }),
      }).then((res) => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.message || "Failed to purchase item");
          });
        }
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Purchase Successful",
        description: "Your purchase has been completed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle wallet connection form submission
  const handleConnectWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
      return;
    }
    connectWalletMutation.mutate(walletAddress);
  };

  // State for purchase confirmation
  const [purchaseItem, setPurchaseItem] = useState<any>(null);
  const [purchaseConfirmOpen, setPurchaseConfirmOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"app" | "external">("app");
  
  // Handle item purchase
  const handlePurchase = (item: any) => {
    setPurchaseItem(item);
    setPurchaseConfirmOpen(true);
    // Default to app balance, but can be changed in dialog
    setPaymentMethod("app");
  };
  
  // Confirm purchase
  const confirmPurchase = () => {
    if (!purchaseItem) return;
    
    if (paymentMethod === "app") {
      // Use app balance
      purchaseItemMutation.mutate(purchaseItem.id);
    } else if (paymentMethod === "external" && wallet?.walletAddress) {
      // If using external wallet, simulate a blockchain transaction
      toast({
        title: "Processing External Payment",
        description: "Sending request to your connected wallet...",
      });
      
      // Simulate blockchain delay
      setTimeout(() => {
        toast({
          title: "External Payment Successful",
          description: `${purchaseItem.price} $FITCOIN was transferred from your external wallet.`,
        });
        // Process the purchase
        purchaseItemMutation.mutate(purchaseItem.id);
      }, 2000);
    }
    
    setPurchaseConfirmOpen(false);
  };

  // Format transaction types for display
  const formatTransactionType = (type: string) => {
    const typeMap: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" }> = {
      "signup_bonus": { label: "Signup Bonus", variant: "default" },
      "workout": { label: "Workout Reward", variant: "secondary" },
      "challenge": { label: "Challenge Reward", variant: "secondary" },
      "social": { label: "Social Reward", variant: "secondary" },
      "referral": { label: "Referral Bonus", variant: "secondary" },
      "purchase": { label: "Purchase", variant: "destructive" }
    };
    
    // Find a matching type
    for (const key in typeMap) {
      if (type.includes(key)) {
        return typeMap[key];
      }
    }
    
    // Default
    return { label: type, variant: "outline" };
  };

  // Calculate transaction balance (+ for incoming, - for outgoing)
  const getTransactionPrefix = (type: string) => {
    return type.includes("purchase") || type.includes("redeem") ? "-" : "+";
  };

  if (!user) {
    // Redirect to login if not authenticated
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your token wallet.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/login")}>Log In</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <Coins className="mr-2 h-8 w-8" /> 
        $FITCOIN Tokens & Rewards
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Wallet Card */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Wallet className="mr-2 h-5 w-5" /> Your Wallet
            </CardTitle>
            <CardDescription>
              Earn $FITCOIN by completing workouts and challenges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isWalletLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : walletError ? (
              <div className="text-red-500">Error loading wallet data</div>
            ) : (
              <>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold mr-2">{wallet?.balance || "0"}</span>
                  <span className="text-muted-foreground">$FITCOIN</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {wallet?.walletAddress ? (
                    <span className="flex items-center">
                      Connected to external wallet: 
                      <span className="ml-1 font-mono text-xs truncate max-w-[200px]">
                        {wallet.walletAddress}
                      </span>
                    </span>
                  ) : (
                    <span>No external wallet connected</span>
                  )}
                </p>
              </>
            )}
          </CardContent>
          <CardFooter>
            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Wallet className="mr-2 h-4 w-4" />
                  {wallet?.walletAddress ? "Update Wallet Address" : "Connect Wallet"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Connect External Wallet</AlertDialogTitle>
                  <AlertDialogDescription>
                    Enter your external wallet address to connect. This allows you to transfer your $FITCOIN to an external blockchain wallet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <form onSubmit={handleConnectWallet}>
                  <div className="py-4">
                    <Label htmlFor="walletAddress">Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x..."
                      className="mt-2"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      type="submit"
                      disabled={connectWalletMutation.isPending}
                    >
                      {connectWalletMutation.isPending ? "Connecting..." : "Connect"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>

        {/* Store Quick Link Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" /> Reward Store
            </CardTitle>
            <CardDescription>
              Redeem your $FITCOIN for rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Use your earned tokens to unlock premium features, merchandise, and gym discounts.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => {
                // Find the store tab and select it
                setTimeout(() => {
                  const storeTab = document.querySelector('[value="store"]') as HTMLElement;
                  if (storeTab) {
                    storeTab.click();
                  }
                  // Scroll to the content
                  const tabsList = document.querySelector('.mb-6');
                  if (tabsList) {
                    const tabsBottom = tabsList.getBoundingClientRect().bottom;
                    window.scrollTo({
                      top: tabsBottom + window.scrollY,
                      behavior: 'smooth'
                    });
                  }
                }, 100);
              }}
            >
              Browse Rewards
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="mb-6">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="store">Reward Store</TabsTrigger>
          <TabsTrigger value="purchases">Your Purchases</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your recent $FITCOIN transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : transactionsError ? (
                <div className="text-red-500">Error loading transaction data</div>
              ) : transactions?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No transactions yet. Complete workouts and challenges to earn $FITCOIN!
                  </p>
                </div>
              ) : (
                <Table>
                  <TableCaption>Your transaction history</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions?.map((transaction: any) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <Badge variant={formatTransactionType(transaction.type).variant}>
                            {formatTransactionType(transaction.type).label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {getTransactionPrefix(transaction.type)}{transaction.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Store Tab */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Reward Store</CardTitle>
              <CardDescription>
                Redeem your $FITCOIN for exclusive rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isStoreLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-40 w-full" />
                  ))}
                </div>
              ) : storeError ? (
                <div className="text-red-500">Error loading store data</div>
              ) : storeItems?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No items available in the store at the moment. Check back later!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {storeItems?.map((item: any) => (
                    <Card key={item.id} className="overflow-hidden">
                      {item.imageUrl && (
                        <div className="h-40 overflow-hidden">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      )}
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{item.name}</CardTitle>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{item.category.replace('_', ' ')}</Badge>
                          <span className="font-bold">{item.price} $FITCOIN</span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                        {item.inventory !== null && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {item.inventory} remaining
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button 
                          className="w-full" 
                          variant="default"
                          disabled={
                            purchaseItemMutation.isPending || 
                            !wallet || 
                            BigInt(wallet.balance) < BigInt(item.price)
                          }
                          onClick={() => handlePurchase(item)}
                        >
                          {purchaseItemMutation.isPending ? (
                            "Processing..."
                          ) : !wallet || BigInt(wallet.balance) < BigInt(item.price) ? (
                            "Insufficient Funds"
                          ) : (
                            "Purchase"
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Purchases Tab */}
        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Your Purchases</CardTitle>
              <CardDescription>
                Items and rewards you've redeemed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPurchasesLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : purchasesError ? (
                <div className="text-red-500">Error loading purchase data</div>
              ) : purchases?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    You haven't made any purchases yet. Visit the Reward Store to redeem your tokens!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchases?.map((purchase: any) => {
                    const item = storeItems?.find((i: any) => i.id === purchase.itemId);
                    
                    return (
                      <Card key={purchase.id}>
                        <div className="flex flex-col md:flex-row gap-4 p-4">
                          {item?.imageUrl && (
                            <div className="h-20 w-20 overflow-hidden rounded-md shrink-0">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{item?.name || 'Unknown Item'}</h3>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="outline">
                                {formatDistanceToNow(new Date(purchase.purchaseDate), { addSuffix: true })}
                              </Badge>
                              <Badge 
                                variant={purchase.status === 'completed' ? 'secondary' : 'outline'}
                              >
                                {purchase.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item?.description}</p>
                            
                            {purchase.redemptionCode && (
                              <div className="mt-2 p-2 bg-muted rounded-md">
                                <p className="text-xs text-muted-foreground mb-1">Redemption Code:</p>
                                <p className="font-mono text-sm">{purchase.redemptionCode}</p>
                              </div>
                            )}
                          </div>
                          <div className="shrink-0 flex flex-col items-end justify-between">
                            <span className="font-bold">{purchase.totalPrice} $FITCOIN</span>
                            {purchase.status === 'pending' && (
                              <Badge variant="outline" className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" /> Processing
                              </Badge>
                            )}
                            {purchase.status === 'completed' && (
                              <Badge variant="secondary" className="flex items-center">
                                <Check className="h-3 w-3 mr-1" /> Completed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Purchase Confirmation Dialog */}
      <AlertDialog open={purchaseConfirmOpen} onOpenChange={setPurchaseConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              {purchaseItem && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {purchaseItem.imageUrl && (
                      <img 
                        src={purchaseItem.imageUrl} 
                        alt={purchaseItem.name} 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold">{purchaseItem.name}</h3>
                      <p className="text-sm text-muted-foreground">{purchaseItem.price} $FITCOIN</p>
                    </div>
                  </div>
                  
                  {wallet?.walletAddress && (
                    <div className="space-y-2 py-2">
                      <p className="text-sm font-medium">Select payment method:</p>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            checked={paymentMethod === "app"}
                            onChange={() => setPaymentMethod("app")}
                            className="h-4 w-4"
                          />
                          <span>Pay from app balance ({wallet.balance} $FITCOIN)</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input
                            type="radio"
                            checked={paymentMethod === "external"}
                            onChange={() => setPaymentMethod("external")}
                            className="h-4 w-4"
                          />
                          <span>Pay from connected wallet (ends with {wallet.walletAddress.slice(-6)})</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPurchase}
              disabled={purchaseItemMutation.isPending}
            >
              {purchaseItemMutation.isPending ? "Processing..." : "Confirm Purchase"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Tokens;