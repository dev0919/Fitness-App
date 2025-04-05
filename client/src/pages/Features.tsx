import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import fitnessLogoSvg from "../assets/fitness-logo.svg";
import workoutIconSvg from "../assets/workout-icon.svg";
import communityIconSvg from "../assets/community-icon.svg";
import rewardIconSvg from "../assets/reward-icon.svg";

const Features = () => {
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
          <Link href="/features" className="text-[#4CAF50] font-medium text-sm hidden md:inline">
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
        <div className="py-16 px-6 md:px-10 lg:px-20 bg-[#F9FFF9]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-4xl font-bold text-[#212121]">Our Features</h1>
              <p className="text-[#616161] mt-3 text-lg max-w-2xl mx-auto">
                Discover how FitConnect is revolutionizing the fitness experience through innovative technology and social connectivity
              </p>
            </div>

            {/* Core Features Section */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <img src={workoutIconSvg} alt="Workout Tracking" className="w-16 h-16" />
                </div>
                <h2 className="text-xl font-bold text-[#212121] mb-3">Advanced Workout Tracking</h2>
                <p className="text-[#616161]">
                  Track every aspect of your fitness journey with precision, from steps and calories to 
                  complex workout routines and progress over time.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <img src={communityIconSvg} alt="Social Community" className="w-16 h-16" />
                </div>
                <h2 className="text-xl font-bold text-[#212121] mb-3">Social Community</h2>
                <p className="text-[#616161]">
                  Connect with friends, share achievements, and motivate each other through our interactive 
                  social feed and friend system.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <img src={rewardIconSvg} alt="Token Rewards" className="w-16 h-16" />
                </div>
                <h2 className="text-xl font-bold text-[#212121] mb-3">Blockchain Rewards</h2>
                <p className="text-[#616161]">
                  Earn FitTokens for your workouts and achievements, redeemable for real-world rewards 
                  and backed by secure blockchain technology.
                </p>
              </div>
            </div>

            {/* Feature Details Sections */}
            <div className="space-y-24">
              {/* Feature 1 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                  <h2 className="text-3xl font-bold text-[#212121] mb-4">Smart Workout Tracking</h2>
                  <p className="text-[#616161] mb-4">
                    Our intelligent workout tracking system adapts to your fitness level and goals, providing 
                    personalized recommendations and detailed analytics.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Track steps, distance, calories, and active minutes</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Create custom workout routines tailored to your goals</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Visualize progress with detailed charts and analytics</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Receive AI-powered suggestions to improve performance</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 bg-[#E8F5E9] rounded-xl p-6 flex items-center justify-center">
                  <div className="w-full max-w-md h-64 bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
                    <div className="w-full">
                      <div className="h-8 bg-[#F5F5F5] rounded-full mb-4 overflow-hidden">
                        <div className="h-full w-3/4 bg-[#4CAF50] rounded-full"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-[#F5F5F5] p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-[#4CAF50]">8,243</div>
                          <div className="text-xs text-[#616161]">Steps</div>
                        </div>
                        <div className="bg-[#F5F5F5] p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-[#4CAF50]">456</div>
                          <div className="text-xs text-[#616161]">Calories</div>
                        </div>
                        <div className="bg-[#F5F5F5] p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-[#4CAF50]">45</div>
                          <div className="text-xs text-[#616161]">Minutes</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pl-12">
                  <h2 className="text-3xl font-bold text-[#212121] mb-4">Interactive Challenges</h2>
                  <p className="text-[#616161] mb-4">
                    Participate in daily, weekly, and monthly challenges designed to push your limits and 
                    keep your fitness routine exciting and engaging.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Join competitive challenges with friends or the global community</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Earn special rewards and badges for completed challenges</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Track your progress and ranking on leaderboards</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Create custom challenges for your friend group</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 bg-[#E8F5E9] rounded-xl p-6 flex items-center justify-center">
                  <div className="w-full max-w-md h-64 bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
                    <div className="w-full">
                      <div className="mb-4 text-center">
                        <h3 className="text-lg font-semibold text-[#212121]">30-Day Push-Up Challenge</h3>
                        <p className="text-sm text-[#616161]">Day 14 of 30</p>
                      </div>
                      <div className="h-6 bg-[#F5F5F5] rounded-full mb-4 overflow-hidden">
                        <div className="h-full w-1/2 bg-[#4CAF50] rounded-full"></div>
                      </div>
                      <div className="text-center mb-2">
                        <span className="text-sm text-[#616161]">Today's Goal:</span>
                        <span className="text-lg font-bold text-[#212121] ml-2">25 Push-Ups</span>
                      </div>
                      <div className="flex justify-center">
                        <div className="px-4 py-2 rounded-full bg-[#4CAF50] text-white text-sm">
                          Mark Complete
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                  <h2 className="text-3xl font-bold text-[#212121] mb-4">Token Reward System</h2>
                  <p className="text-[#616161] mb-4">
                    Our innovative blockchain-based reward system lets you earn FitTokens for your activities, 
                    which can be redeemed for exclusive products, services, and discounts.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Earn tokens for completing workouts and challenges</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Secure blockchain-based token system ensures transparency</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Redeem tokens for fitness products, subscriptions, and more</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-[#4CAF50] mt-1 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#616161]">Connect to external wallets for managing your tokens</span>
                    </li>
                  </ul>
                </div>
                <div className="md:w-1/2 bg-[#E8F5E9] rounded-xl p-6 flex items-center justify-center">
                  <div className="w-full max-w-md h-64 bg-white rounded-lg shadow-sm p-4 flex items-center justify-center">
                    <div className="w-full">
                      <div className="mb-6 text-center">
                        <h3 className="text-lg font-semibold text-[#212121]">Your Token Wallet</h3>
                      </div>
                      <div className="mb-6 text-center">
                        <span className="text-3xl font-bold text-[#4CAF50]">2,450</span>
                        <span className="text-xl text-[#212121] ml-2">FitTokens</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#F5F5F5] p-2 rounded-lg text-center">
                          <span className="text-sm text-[#616161]">Earned Today</span>
                          <div className="text-lg font-semibold text-[#4CAF50]">+125</div>
                        </div>
                        <div className="bg-[#F5F5F5] p-2 rounded-lg text-center">
                          <span className="text-sm text-[#616161]">This Month</span>
                          <div className="text-lg font-semibold text-[#4CAF50]">+1,250</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-20 text-center">
              <h2 className="text-2xl font-bold text-[#212121] mb-4">
                Ready to experience these features?
              </h2>
              <p className="text-[#616161] max-w-2xl mx-auto mb-8">
                Join FitConnect today and discover a new way to approach fitness that's social, rewarding, and tailored to your goals.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register">
                  <Button className="bg-[#4CAF50] hover:bg-[#388E3C] px-8 py-2">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9] px-8 py-2">
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

export default Features;