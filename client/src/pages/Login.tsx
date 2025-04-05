import * as React from "react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import SVG assets
import fitnessLogoSvg from "../assets/fitness-logo.svg";
import workoutIconSvg from "../assets/workout-icon.svg";
import communityIconSvg from "../assets/community-icon.svg";
import rewardIconSvg from "../assets/reward-icon.svg";
import heroBgSvg from "../assets/hero-bg.svg";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Setup form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Login mutation
  const login = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      setIsLoading(true);
      try {
        console.log("Login page: attempting login with:", data.username);
        // apiRequest already returns the parsed JSON response
        const userData = await apiRequest("POST", "/api/auth/login", data);
        console.log("Login page: received response:", userData);
        return userData;
      } catch (error) {
        console.error("Login page: error during login:", error);
        setIsLoading(false);
        throw error;
      }
    },
    onSuccess: (userData) => {
      console.log("Login page: login successful, redirecting to dashboard");
      setIsLoading(false);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.firstName}!`,
      });
      
      // Use window.location for a hard refresh to ensure authentication state is updated
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      console.error("Login page: login failed:", error);
      setIsLoading(false);
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: LoginFormValues) => {
    login.mutate(data);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <img src={fitnessLogoSvg} alt="FitConnect Logo" className="h-10 w-10" />
          <h1 className="text-2xl font-bold text-[#4CAF50]">FitConnect</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/about" className="text-[#616161] hover:text-[#4CAF50] text-sm hidden md:inline">
            About
          </Link>
          <Link href="/features" className="text-[#616161] hover:text-[#4CAF50] text-sm hidden md:inline">
            Features
          </Link>
          <Link href="/pricing" className="text-[#616161] hover:text-[#4CAF50] text-sm hidden md:inline">
            Pricing
          </Link>
          <Link href="/register">
            <Button variant="outline" className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9]">
              Register
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section 
          className="relative py-20 px-6 md:px-10 lg:px-20 flex flex-col md:flex-row items-center"
          style={{ 
            backgroundImage: `url(${heroBgSvg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl font-bold text-[#212121] leading-tight">
              Your Fitness Journey <span className="text-[#4CAF50]">Reimagined</span>
            </h1>
            <p className="text-[#616161] text-lg my-6">
              Connect with friends, track your progress, earn rewards, and transform your fitness experience with our innovative blockchain-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white py-6 px-8 rounded-lg text-lg">
                  Try Free Demo
                </Button>
              </Link>
              <Link href="/learn-more">
                <Button variant="outline" className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9] py-6 px-8 rounded-lg text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold text-[#212121]">Welcome Back</h2>
                  <p className="text-[#616161] mt-2">Sign in to your FitConnect account</p>
                </div>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter your password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#4CAF50] hover:bg-[#388E3C]"
                          disabled={isLoading}
                        >
                          {isLoading ? "Logging in..." : "Login"}
                        </Button>
                      </form>
                    </Form>
                    <div className="mt-4 text-center text-sm text-[#9E9E9E]">
                      <p>Demo account: username: alex, password: password123</p>
                    </div>
                  </TabsContent>
                  <TabsContent value="register">
                    <div className="text-center py-8">
                      <p className="text-[#616161] mb-4">Create a new account to get started</p>
                      <Link href="/register">
                        <Button className="bg-[#4CAF50] hover:bg-[#388E3C]">
                          Go to Registration
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 md:px-10 lg:px-20 bg-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#212121]">Key Features</h2>
            <p className="text-[#616161] mt-3 max-w-2xl mx-auto">
              FitConnect combines cutting-edge technology with social fitness to create a unique experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#F5F5F5] rounded-xl p-6 transition-all hover:shadow-md">
              <img src={workoutIconSvg} alt="Workout Tracking" className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-bold text-[#212121] mb-2">
                Smart Workout Tracking
              </h3>
              <p className="text-[#616161]">
                Track your workouts, set goals, and monitor your progress with advanced analytics.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-[#F5F5F5] rounded-xl p-6 transition-all hover:shadow-md">
              <img src={communityIconSvg} alt="Social Community" className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-bold text-[#212121] mb-2">
                Social Community
              </h3>
              <p className="text-[#616161]">
                Connect with friends, share achievements, and motivate each other on your fitness journeys.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-[#F5F5F5] rounded-xl p-6 transition-all hover:shadow-md">
              <img src={rewardIconSvg} alt="Token Rewards" className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-bold text-[#212121] mb-2">
                Token Rewards
              </h3>
              <p className="text-[#616161]">
                Earn tokens for completing workouts and challenges that can be redeemed for real rewards.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-[#F5F5F5] rounded-xl p-6 transition-all hover:shadow-md">
              <img src={fitnessLogoSvg} alt="Fitness Challenges" className="h-16 w-16 mb-4" />
              <h3 className="text-xl font-bold text-[#212121] mb-2">
                Engaging Challenges
              </h3>
              <p className="text-[#616161]">
                Participate in daily and weekly challenges to push your limits and earn special rewards.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-6 md:px-10 lg:px-20 bg-[#E8F5E9] text-center">
          <h2 className="text-3xl font-bold text-[#212121] mb-4">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-[#616161] max-w-2xl mx-auto mb-8">
            Join thousands of users who have already revolutionized their fitness experience with FitConnect.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-lg px-8 py-6">
                Get Started Now
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="border-[#4CAF50] text-[#4CAF50] hover:bg-white text-lg px-8 py-6">
                View Demo
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#212121] text-white py-12 px-6 md:px-10 lg:px-20">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={fitnessLogoSvg} alt="FitConnect Logo" className="h-8 w-8" />
              <h3 className="text-xl font-bold">FitConnect</h3>
            </div>
            <p className="text-gray-400">
              The future of fitness tracking and social networking.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link href="/features" className="text-gray-400 hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link href="/learn-more" className="text-gray-400 hover:text-white">Learn More</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/learn-more" className="text-gray-400 hover:text-white">Documentation</Link></li>
              <li><Link href="/learn-more" className="text-gray-400 hover:text-white">Help Center</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="text-gray-400 hover:text-white">Login</Link></li>
              <li><Link href="/register" className="text-gray-400 hover:text-white">Register</Link></li>
              <li><Link href="/login" className="text-gray-400 hover:text-white">Demo Account</Link></li>
              <li><Link href="/features" className="text-gray-400 hover:text-white">Features</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} FitConnect. All rights reserved.</p>
          <div className="mt-2">
            <Link href="/about" className="text-gray-400 hover:text-white mx-2">About</Link>
            <Link href="/features" className="text-gray-400 hover:text-white mx-2">Features</Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white mx-2">Pricing</Link>
            <Link href="/learn-more" className="text-gray-400 hover:text-white mx-2">Learn More</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
