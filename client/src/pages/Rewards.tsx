import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { 
  ShoppingCart, 
  Coins, 
  Filter, 
  ArrowUpDown, 
  Search, 
  Tag,
  Gift
} from "lucide-react";

const Rewards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"price-asc" | "price-desc">("price-asc");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);

  // Query wallet data
  const {
    data: wallet,
    isLoading: isWalletLoading,
    error: walletError,
  } = useQuery({
    queryKey: ["/api/wallet"],
    enabled: !!user,
  });

  // Query reward store items
  const {
    data: storeItems,
    isLoading: isStoreLoading,
    error: storeError,
  } = useQuery({
    queryKey: ["/api/store"],
    enabled: true,
  });

  // Mutation to purchase item from store
  const purchaseItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number, quantity: number }) => {
      return fetch("/api/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          itemId,
          quantity,
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
      setIsDialogOpen(false);
      setPurchaseQuantity(1);
      setSelectedItem(null);
    },
    onError: (error) => {
      toast({
        title: "Purchase Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle purchase confirmation
  const handleConfirmPurchase = () => {
    if (!selectedItem) return;
    
    purchaseItemMutation.mutate({
      itemId: selectedItem.id,
      quantity: purchaseQuantity
    });
  };

  // Get unique categories from store items
  const getCategories = () => {
    if (!storeItems) return [];
    const categories = storeItems.map((item: any) => item.category);
    return [...new Set(categories)];
  };

  // Filter and sort store items
  const getFilteredItems = () => {
    if (!storeItems) return [];
    
    let filtered = [...storeItems];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item: any) => 
        item.name.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter((item: any) => 
        item.category === categoryFilter
      );
    }
    
    // Apply sorting
    filtered.sort((a: any, b: any) => {
      const priceA = BigInt(a.price);
      const priceB = BigInt(b.price);
      
      if (sortOrder === "price-asc") {
        return priceA < priceB ? -1 : priceA > priceB ? 1 : 0;
      } else {
        return priceA > priceB ? -1 : priceA < priceB ? 1 : 0;
      }
    });
    
    return filtered;
  };

  // Format category name for display
  const formatCategory = (category: string) => {
    return category.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Check if the user can afford an item
  const canAfford = (price: string) => {
    if (!wallet) return false;
    try {
      return BigInt(wallet.balance) >= BigInt(price);
    } catch (e) {
      return false;
    }
  };

  // Calculate total price based on quantity
  const calculateTotalPrice = () => {
    if (!selectedItem) return "0";
    try {
      return (BigInt(selectedItem.price) * BigInt(purchaseQuantity)).toString();
    } catch (e) {
      return "0";
    }
  };

  if (!user) {
    // Redirect to login if not authenticated
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access the rewards store.</CardDescription>
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
      <div className="flex flex-col md:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center">
            <Gift className="mr-2 h-8 w-8" /> 
            Reward Store
          </h1>
          <p className="text-muted-foreground">
            Redeem your $FITCOIN for exclusive rewards and benefits
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/tokens")}>
            <Coins className="mr-2 h-4 w-4" />
            {isWalletLoading ? (
              <Skeleton className="h-4 w-16" />
            ) : (
              <span>{wallet?.balance || "0"} $FITCOIN</span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rewards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Tag className="mr-2 h-4 w-4" />
                <span>{categoryFilter ? formatCategory(categoryFilter) : "All Categories"}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {getCategories().map((category: string) => (
                <SelectItem key={category} value={category}>
                  {formatCategory(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortOrder} onValueChange={(value: "price-asc" | "price-desc") => setSortOrder(value)}>
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                <span>
                  {sortOrder === "price-asc" ? "Price: Low to High" : "Price: High to Low"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Store Items Grid */}
      {isStoreLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : storeError ? (
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Failed to load reward store items.</p>
          </CardContent>
        </Card>
      ) : getFilteredItems().length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Items Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No items match your current filters. Try adjusting your search or category filters.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter(null);
              }}
            >
              Clear Filters
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {getFilteredItems().map((item: any) => (
            <Card key={item.id} className="overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
              {item.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              <CardHeader className="p-4 pb-0">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {formatCategory(item.category)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center mt-1 text-lg font-semibold">
                  <Coins className="mr-1 h-4 w-4" />
                  {item.price} $FITCOIN
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-2 flex-grow">
                <p className="text-muted-foreground">
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
                  disabled={!user || !canAfford(item.price)}
                  onClick={() => {
                    setSelectedItem(item);
                    setIsDialogOpen(true);
                  }}
                >
                  {!user ? (
                    "Log in to Purchase"
                  ) : !canAfford(item.price) ? (
                    "Insufficient $FITCOIN"
                  ) : (
                    "Purchase"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Purchase Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedItem && (
                <div className="mt-2">
                  <div className="flex items-center gap-4">
                    {selectedItem.imageUrl && (
                      <div className="h-16 w-16 overflow-hidden rounded-md">
                        <img
                          src={selectedItem.imageUrl}
                          alt={selectedItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground">{selectedItem.name}</h3>
                      <p className="text-sm">{selectedItem.description}</p>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Price per item:</span>
                      <span className="font-semibold">{selectedItem.price} $FITCOIN</span>
                    </div>
                    
                    {selectedItem.inventory !== null && (
                      <div className="flex flex-col gap-2">
                        <label htmlFor="quantity" className="text-sm">
                          Quantity (max {Math.min(selectedItem.inventory, 
                            Math.floor(Number(BigInt(wallet?.balance || "0") / BigInt(selectedItem.price))))})
                        </label>
                        <Input
                          id="quantity"
                          type="number"
                          min={1}
                          max={Math.min(
                            selectedItem.inventory, 
                            Math.floor(Number(BigInt(wallet?.balance || "0") / BigInt(selectedItem.price)))
                          )}
                          value={purchaseQuantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (isNaN(val) || val < 1) {
                              setPurchaseQuantity(1);
                            } else {
                              const max = Math.min(
                                selectedItem.inventory,
                                Math.floor(Number(BigInt(wallet?.balance || "0") / BigInt(selectedItem.price)))
                              );
                              setPurchaseQuantity(Math.min(val, max));
                            }
                          }}
                        />
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between font-bold">
                      <span>Total:</span>
                      <span>{calculateTotalPrice()} $FITCOIN</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Your balance after purchase: {wallet ? 
                        (BigInt(wallet.balance) - BigInt(calculateTotalPrice())).toString() 
                        : "0"} $FITCOIN
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPurchase}
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

export default Rewards;