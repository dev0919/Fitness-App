import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Switch } from "@/components/ui/switch";

// Profile update schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  profileImage: z.string().optional(),
});

// Password update schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Settings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'account' | 'notifications' | 'privacy'>('account');
  
  // Fetch user data
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
  });
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      profileImage: user?.profileImage || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Update profile when user data loads
  if (user && !isLoading && profileForm.getValues().firstName === "") {
    profileForm.reset({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      profileImage: user.profileImage || "",
    });
  }
  
  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      return await apiRequest("PATCH", `/api/users/${user.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile.",
        variant: "destructive",
      });
    },
  });
  
  // Change password mutation
  const changePassword = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      return await apiRequest("PATCH", `/api/users/${user.id}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: () => {
      toast({
        title: "Password change failed",
        description: "There was a problem changing your password. Please check your current password.",
        variant: "destructive",
      });
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(data);
  };
  
  // Handle password form submission
  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePassword.mutate(data);
  };
  
  if (isLoading) {
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
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#212121]">Settings</h2>
          <p className="text-[#616161] mt-1">Manage your account preferences</p>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul>
              <li>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`w-full text-left px-4 py-3 ${
                    activeTab === 'account' 
                      ? 'bg-[#F5F5F5] border-l-4 border-[#4CAF50]' 
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <i className={`fas fa-user mr-3 ${activeTab === 'account' ? 'text-[#4CAF50]' : 'text-[#616161]'}`}></i>
                    <span>Account</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full text-left px-4 py-3 ${
                    activeTab === 'notifications' 
                      ? 'bg-[#F5F5F5] border-l-4 border-[#4CAF50]' 
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <i className={`fas fa-bell mr-3 ${activeTab === 'notifications' ? 'text-[#4CAF50]' : 'text-[#616161]'}`}></i>
                    <span>Notifications</span>
                  </div>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full text-left px-4 py-3 ${
                    activeTab === 'privacy' 
                      ? 'bg-[#F5F5F5] border-l-4 border-[#4CAF50]' 
                      : 'border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <i className={`fas fa-lock mr-3 ${activeTab === 'privacy' ? 'text-[#4CAF50]' : 'text-[#616161]'}`}></i>
                    <span>Privacy</span>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1">
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Profile Information */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-[#E0E0E0]">
                  <h3 className="text-lg leading-6 font-medium text-[#212121]">
                    Profile Information
                  </h3>
                  <p className="mt-1 text-sm text-[#616161]">
                    Update your basic profile details
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={profileForm.control}
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
                          control={profileForm.control}
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
                        control={profileForm.control}
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
                        control={profileForm.control}
                        name="profileImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profile Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="URL to your profile image" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="bg-[#4CAF50] hover:bg-[#388E3C]"
                          disabled={updateProfile.isPending}
                        >
                          {updateProfile.isPending ? "Updating..." : "Update Profile"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
              
              {/* Change Password */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-[#E0E0E0]">
                  <h3 className="text-lg leading-6 font-medium text-[#212121]">
                    Change Password
                  </h3>
                  <p className="mt-1 text-sm text-[#616161]">
                    Update your password regularly for security
                  </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter current password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter new password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm new password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="bg-[#4CAF50] hover:bg-[#388E3C]"
                          disabled={changePassword.isPending}
                        >
                          {changePassword.isPending ? "Updating..." : "Change Password"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-[#E0E0E0]">
                <h3 className="text-lg leading-6 font-medium text-[#212121]">
                  Notification Settings
                </h3>
                <p className="mt-1 text-sm text-[#616161]">
                  Choose what notifications you want to receive
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="divide-y divide-[#E0E0E0]">
                  <li className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-[#212121]">Friend Activity</p>
                      <p className="text-xs text-[#616161]">Notify when friends share activities or achievements</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </li>
                  <li className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-[#212121]">Workout Reminders</p>
                      <p className="text-xs text-[#616161]">Receive reminders for scheduled workouts</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </li>
                  <li className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-[#212121]">Challenge Updates</p>
                      <p className="text-xs text-[#616161]">Notifications about challenges you're participating in</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </li>
                  <li className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-[#212121]">New Challenges</p>
                      <p className="text-xs text-[#616161]">Get notified when new challenges are available</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </li>
                  <li className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-[#212121]">Email Notifications</p>
                      <p className="text-xs text-[#616161]">Receive digest emails about your fitness progress</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </li>
                </ul>
                <div className="pt-4">
                  <Button className="bg-[#4CAF50] hover:bg-[#388E3C]">
                    Save Preferences
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'privacy' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-[#E0E0E0]">
                <h3 className="text-lg leading-6 font-medium text-[#212121]">
                  Privacy Settings
                </h3>
                <p className="mt-1 text-sm text-[#616161]">
                  Control your data and activity visibility
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="divide-y divide-[#E0E0E0]">
                  <li className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-[#212121]">Profile Visibility</p>
                      <p className="text-xs text-[#616161]">Who can see your profile information</p>
                    </div>
                    <select className="border border-[#E0E0E0] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF50] focus:border-[#4CAF50]">
                      <option value="public">Everyone</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </li>
                  <li className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-[#212121]">Workout Sharing</p>
                      <p className="text-xs text-[#616161]">Who can see your workouts</p>
                    </div>
                    <select className="border border-[#E0E0E0] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4CAF50] focus:border-[#4CAF50]">
                      <option value="public">Everyone</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                  </li>
                  <li className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-[#212121]">Activity Stats</p>
                      <p className="text-xs text-[#616161]">Share your activity statistics with friends</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </li>
                  <li className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-[#212121]">Location Sharing</p>
                      <p className="text-xs text-[#616161]">Allow app to use your location for tracking</p>
                    </div>
                    <Switch defaultChecked={true} />
                  </li>
                  <li className="py-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-[#212121]">Data Analytics</p>
                      <p className="text-xs text-[#616161]">Allow us to use your data for service improvements</p>
                    </div>
                    <Switch defaultChecked={false} />
                  </li>
                </ul>
                <div className="pt-4">
                  <Button className="bg-[#4CAF50] hover:bg-[#388E3C]">
                    Save Privacy Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
