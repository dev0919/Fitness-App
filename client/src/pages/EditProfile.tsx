import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isValidAddress } from "@/lib/web3Config";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Profile update schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  profileImage: z.string().optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().optional(),
  walletAddress: z.string().optional()
    .refine(
      (val) => !val || isValidAddress(val),
      { message: "Invalid Ethereum wallet address format" }
    ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const EditProfile = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch user data
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });
  
  // Setup form with default values
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      profileImage: "",
      username: "",
      bio: "",
      walletAddress: "",
    },
  });
  
  // Update form when user data loads
  if (user && !isUserLoading && form.getValues().firstName === "") {
    form.reset({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      profileImage: user.profileImage || "",
      username: user.username || "",
      bio: user.bio || "",
      walletAddress: user.walletAddress || "",
    });
    
    if (user.profileImage) {
      setPreviewImage(user.profileImage);
    }
  }
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      setIsLoading(true);
      return await apiRequest("PATCH", `/api/users/${user.id}`, data);
    },
    onSuccess: () => {
      setIsLoading(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      navigate("/profile");
    },
    onError: () => {
      setIsLoading(false);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    },
  });
  
  // Handle profile form submission
  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(data);
  };
  
  // Handle image selection
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        form.setValue("profileImage", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Trigger file input click
  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };
  
  // Handle external URL for profile image
  const handleImageUrlChange = (url: string) => {
    setPreviewImage(url);
    form.setValue("profileImage", url);
  };
  
  if (isUserLoading) {
    return (
      <div className="px-4 py-6 md:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-4 py-6 md:px-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#212121]">Edit Profile</h2>
        <p className="text-[#616161] mt-1">Update your personal information and preferences</p>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage how others see you on FitConnect</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="photo">Profile Photo</TabsTrigger>
              <TabsTrigger value="web3">Web3</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                            placeholder="Tell us about yourself"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end pt-2 space-x-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/profile")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-[#4CAF50] hover:bg-[#388E3C]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="photo">
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={previewImage || ""} />
                      <AvatarFallback className="text-3xl">{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <Button 
                      onClick={handleSelectImage}
                      type="button"
                      className="bg-[#4CAF50] hover:bg-[#388E3C]"
                    >
                      Upload from device
                    </Button>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-[#212121] mb-2">Or use an image URL</h3>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter image URL"
                      value={form.getValues().profileImage || ""}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setPreviewImage(form.getValues().profileImage || null);
                      }}
                    >
                      Preview
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end pt-2 space-x-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/profile")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={form.handleSubmit(onSubmit)}
                    className="bg-[#4CAF50] hover:bg-[#388E3C]"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="web3">
              <div className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-[#212121]">Web3 Wallet Connection</h3>
                  <p className="text-sm text-[#616161] mt-1">
                    Connect your Ethereum wallet to display your NFT badges and fitness achievements
                  </p>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="walletAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ethereum Wallet Address</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0x..." 
                              {...field}
                              className="font-mono text-sm"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-[#616161] mt-1">
                            Enter your Ethereum wallet address to display your NFT badges on your profile
                          </p>
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <div className="bg-[#F5F5F5] rounded-md p-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <i className="fas fa-info-circle text-[#7C4DFF] mt-1"></i>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-[#212121]">About Web3 Integration</h4>
                            <ul className="mt-1 text-xs text-[#616161] space-y-1 list-disc pl-4">
                              <li>FitConnect can display fitness-related NFT badges from your wallet</li>
                              <li>We only read from your wallet - we never request transaction signing</li>
                              <li>After connecting, refresh your NFT badges on your profile page</li>
                              <li>Your address is only stored to read NFTs and is never shared with third parties</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-2 space-x-2">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/profile")}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="bg-[#7C4DFF] hover:bg-[#651FFF]"
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save Wallet Address"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfile;