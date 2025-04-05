import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import fitnessLogoSvg from "../assets/fitness-logo.svg";
import workoutIconSvg from "../assets/workout-icon.svg";
import communityIconSvg from "../assets/community-icon.svg";
import rewardIconSvg from "../assets/reward-icon.svg";

const LearnMore = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <header className="w-full py-4 px-6 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <img src={fitnessLogoSvg} alt="FitConnect Logo" className="h-10 w-10" />
              <h1 className="text-2xl font-bold text-[#4CAF50]">FitConnect</h1>
            </div>
          </Link>
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
          <Link href="/login">
            <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white">
              Login
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="py-12 px-6 md:px-10 lg:px-20 bg-[#F9FFF9]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-[#212121]">
                Learn More About <span className="text-[#4CAF50]">FitConnect</span>
              </h1>
              <p className="text-[#616161] mt-3 text-lg max-w-2xl mx-auto">
                Discover how our platform is revolutionizing fitness through social connectivity, 
                gamification, and blockchain rewards
              </p>
            </div>

            <Tabs defaultValue="platform" className="w-full mb-16">
              <TabsList className="grid w-full md:w-[600px] mx-auto grid-cols-3 mb-12">
                <TabsTrigger value="platform">The Platform</TabsTrigger>
                <TabsTrigger value="technology">Technology</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
              </TabsList>
              
              <TabsContent value="platform" className="space-y-16">
                <section className="flex flex-col md:flex-row items-start gap-10">
                  <div className="md:w-1/2">
                    <h2 className="text-2xl font-bold text-[#212121] mb-4">A Complete Fitness Ecosystem</h2>
                    <p className="text-[#616161] mb-4">
                      FitConnect is more than just a fitness tracker—it's a comprehensive platform designed to transform how you approach 
                      fitness. By combining cutting-edge tracking technology with social features and reward systems, we've created a 
                      unique ecosystem that keeps you motivated and engaged with your fitness journey.
                    </p>
                    <p className="text-[#616161]">
                      Our platform adapts to your individual needs and goals, providing personalized recommendations, 
                      challenges, and rewards that evolve as you progress. Whether you're just starting your fitness journey 
                      or you're a seasoned athlete, FitConnect provides the tools and community support to help you achieve 
                      your goals.
                    </p>
                  </div>
                  <div className="md:w-1/2 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-[#212121] mb-4">Platform Components</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Activity Tracking Dashboard</h4>
                          <p className="text-sm text-[#616161]">
                            Track workouts, monitor progress, and visualize your fitness journey through intuitive charts and metrics.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Social Networking</h4>
                          <p className="text-sm text-[#616161]">
                            Connect with friends, share achievements, and motivate each other through our interactive social feed.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Challenge System</h4>
                          <p className="text-sm text-[#616161]">
                            Participate in daily, weekly, and monthly challenges that push your limits and keep your routine exciting.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Token Reward System</h4>
                          <p className="text-sm text-[#616161]">
                            Earn tokens for completing workouts and challenges, redeemable for real-world rewards and benefits.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="bg-white p-8 rounded-xl shadow-sm">
                  <h2 className="text-2xl font-bold text-[#212121] mb-6 text-center">How It Works</h2>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="text-center p-4">
                      <div className="h-12 w-12 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl font-bold text-[#4CAF50]">1</span>
                      </div>
                      <h3 className="font-medium text-[#212121] mb-2">Sign Up</h3>
                      <p className="text-sm text-[#616161]">
                        Create your account and set up your fitness profile with goals and preferences.
                      </p>
                    </div>
                    <div className="text-center p-4">
                      <div className="h-12 w-12 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl font-bold text-[#4CAF50]">2</span>
                      </div>
                      <h3 className="font-medium text-[#212121] mb-2">Connect</h3>
                      <p className="text-sm text-[#616161]">
                        Add friends, join groups, and engage with the community for motivation.
                      </p>
                    </div>
                    <div className="text-center p-4">
                      <div className="h-12 w-12 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl font-bold text-[#4CAF50]">3</span>
                      </div>
                      <h3 className="font-medium text-[#212121] mb-2">Track Activity</h3>
                      <p className="text-sm text-[#616161]">
                        Record workouts, track progress, and participate in challenges to earn tokens.
                      </p>
                    </div>
                    <div className="text-center p-4">
                      <div className="h-12 w-12 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl font-bold text-[#4CAF50]">4</span>
                      </div>
                      <h3 className="font-medium text-[#212121] mb-2">Earn Rewards</h3>
                      <p className="text-sm text-[#616161]">
                        Redeem your earned tokens for rewards in our marketplace.
                      </p>
                    </div>
                  </div>
                </section>
              </TabsContent>
              
              <TabsContent value="technology" className="space-y-16">
                <section className="flex flex-col md:flex-row items-start gap-10">
                  <div className="md:w-1/2">
                    <h2 className="text-2xl font-bold text-[#212121] mb-4">Blockchain Integration</h2>
                    <p className="text-[#616161] mb-4">
                      At the heart of FitConnect's reward system is our innovative blockchain integration. We leverage blockchain 
                      technology to create a transparent, secure, and fair reward system that truly values your fitness efforts.
                    </p>
                    <p className="text-[#616161]">
                      Each FitToken you earn is recorded on the blockchain, ensuring that your rewards are immutable and 
                      truly yours. This technology also enables us to create unique NFT badges that commemorate your 
                      achievements and can be showcased in your profile or even traded with other users.
                    </p>
                    <p className="text-[#616161] mt-4">
                      Unlike traditional fitness apps that offer arbitrary point systems, our blockchain-based approach 
                      provides real value that can be exchanged for products and services in our marketplace or even 
                      transferred to external wallets.
                    </p>
                  </div>
                  <div className="md:w-1/2 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-[#212121] mb-4">Technical Features</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Secure Token Wallet</h4>
                          <p className="text-sm text-[#616161]">
                            Built-in wallet to securely store and manage your earned tokens with optional external wallet integration.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">NFT Achievement Badges</h4>
                          <p className="text-sm text-[#616161]">
                            Earn unique, blockchain-verified badges for significant achievements that you can showcase or trade.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Smart Contracts</h4>
                          <p className="text-sm text-[#616161]">
                            Transparent reward rules and marketplace transactions governed by blockchain smart contracts.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Reward Marketplace</h4>
                          <p className="text-sm text-[#616161]">
                            Exchange your tokens for real-world fitness products, subscriptions, and exclusive experiences.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="bg-white p-8 rounded-xl shadow-sm">
                  <h2 className="text-2xl font-bold text-[#212121] mb-6 text-center">Advanced Analytics</h2>
                  <p className="text-[#616161] text-center max-w-3xl mx-auto mb-8">
                    Our platform leverages advanced data analytics to provide personalized insights and recommendations 
                    that help you optimize your fitness journey and achieve your goals faster.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-4 border border-gray-100 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
                        <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-[#212121] mb-2">Performance Tracking</h3>
                      <p className="text-sm text-[#616161]">
                        Detailed metrics and visualizations of your workouts, progress, and achievements over time.
                      </p>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
                        <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-[#212121] mb-2">Personalized Recommendations</h3>
                      <p className="text-sm text-[#616161]">
                        AI-driven workout suggestions based on your performance, goals, and preferences.
                      </p>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mb-4">
                        <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                        </svg>
                      </div>
                      <h3 className="font-medium text-[#212121] mb-2">Trend Analysis</h3>
                      <p className="text-sm text-[#616161]">
                        Identify patterns in your fitness journey to optimize your approach and overcome plateaus.
                      </p>
                    </div>
                  </div>
                </section>
              </TabsContent>
              
              <TabsContent value="community" className="space-y-16">
                <section className="flex flex-col md:flex-row items-start gap-10">
                  <div className="md:w-1/2">
                    <h2 className="text-2xl font-bold text-[#212121] mb-4">The Social Fitness Experience</h2>
                    <p className="text-[#616161] mb-4">
                      FitConnect transforms solo workouts into a social experience. Our community features are designed 
                      to connect you with like-minded individuals who share your fitness interests and goals.
                    </p>
                    <p className="text-[#616161]">
                      Research shows that individuals who exercise in groups or with social support are more likely to 
                      adhere to their fitness routines and achieve their goals. Our platform leverages this insight by 
                      creating numerous opportunities for social engagement and mutual encouragement.
                    </p>
                    <p className="text-[#616161] mt-4">
                      From sharing workout achievements on your feed to participating in group challenges or sending 
                      motivational messages to friends, FitConnect makes fitness a collaborative journey rather than 
                      a solitary endeavor.
                    </p>
                  </div>
                  <div className="md:w-1/2 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-[#212121] mb-4">Community Features</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Activity Feed</h4>
                          <p className="text-sm text-[#616161]">
                            Share your workouts, achievements, and fitness milestones with friends and followers.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Group Challenges</h4>
                          <p className="text-sm text-[#616161]">
                            Create or join challenges with friends to compete, collaborate, and push each other to new heights.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Friend System</h4>
                          <p className="text-sm text-[#616161]">
                            Connect with friends, send messages, and provide mutual encouragement and accountability.
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="h-10 w-10 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4 flex-shrink-0">
                          <svg className="w-5 h-5 text-[#4CAF50]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#212121]">Leaderboards</h4>
                          <p className="text-sm text-[#616161]">
                            Compare your performance with friends and the global community in various fitness categories.
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </section>

                <section className="bg-white p-8 rounded-xl shadow-sm">
                  <h2 className="text-2xl font-bold text-[#212121] mb-6 text-center">Success Stories</h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="p-6 border border-gray-100 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4">
                          <span className="text-lg font-bold text-[#4CAF50]">JS</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-[#212121]">James S.</h3>
                          <p className="text-sm text-[#616161]">Member since 2025</p>
                        </div>
                      </div>
                      <p className="text-[#616161] italic">
                        "FitConnect completely transformed my approach to fitness. The social aspect kept me motivated, 
                        and the token rewards gave me tangible goals to work toward. I've lost 30 pounds and made amazing 
                        friends in the process!"
                      </p>
                    </div>
                    <div className="p-6 border border-gray-100 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 rounded-full bg-[#E8F5E9] flex items-center justify-center mr-4">
                          <span className="text-lg font-bold text-[#4CAF50]">ML</span>
                        </div>
                        <div>
                          <h3 className="font-medium text-[#212121]">Maria L.</h3>
                          <p className="text-sm text-[#616161]">Member since 2025</p>
                        </div>
                      </div>
                      <p className="text-[#616161] italic">
                        "As someone who always struggled with consistency, the challenge system and token rewards were 
                        game-changers for me. I've maintained a workout streak for 6 months and earned enough tokens 
                        for a new fitness watch!"
                      </p>
                    </div>
                  </div>
                </section>
              </TabsContent>
            </Tabs>

            {/* Call to Action */}
            <div className="bg-[#E8F5E9] p-8 rounded-xl text-center">
              <h2 className="text-2xl font-bold text-[#212121] mb-4">
                Ready to join the FitConnect community?
              </h2>
              <p className="text-[#616161] max-w-2xl mx-auto mb-6">
                Start your fitness journey with a platform that rewards your efforts, connects you with like-minded individuals, 
                and transforms how you approach fitness.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register">
                  <Button className="bg-[#4CAF50] hover:bg-[#388E3C] px-8 py-2">
                    Create Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-[#4CAF50] text-[#4CAF50] hover:bg-white px-8 py-2">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#212121] text-white py-8 px-6 md:px-10 lg:px-20">
        <div className="text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} FitConnect. All rights reserved.</p>
          <div className="mt-2">
            <Link href="/about" className="text-gray-400 hover:text-white mx-2">About</Link>
            <Link href="/features" className="text-gray-400 hover:text-white mx-2">Features</Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white mx-2">Pricing</Link>
            <Link href="/login" className="text-gray-400 hover:text-white mx-2">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LearnMore;