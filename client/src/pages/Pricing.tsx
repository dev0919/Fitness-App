import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import fitnessLogoSvg from "../assets/fitness-logo.svg";

const Pricing = () => {
  const [annual, setAnnual] = useState(false);
  
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
          <Link href="/pricing" className="text-[#4CAF50] font-medium text-sm hidden md:inline">
            Pricing
          </Link>
          <Link href="/login">
            <Button className="bg-[#4CAF50] hover:bg-[#388E3C] text-white">
              Login
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-16 px-6 md:px-10 lg:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#212121]">Simple, Transparent Pricing</h1>
            <p className="text-[#616161] mt-3 text-lg max-w-2xl mx-auto">
              Choose the plan that fits your fitness goals and budget. All plans include core features.
            </p>
          </div>

          {/* Pricing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm ${!annual ? 'text-[#4CAF50] font-medium' : 'text-[#616161]'}`}>Monthly</span>
            <div 
              onClick={() => setAnnual(!annual)}
              className="cursor-pointer"
            >
              <Switch 
                checked={annual} 
                onCheckedChange={setAnnual} 
              />
            </div>
            <div className="flex items-center">
              <span className={`text-sm ${annual ? 'text-[#4CAF50] font-medium' : 'text-[#616161]'}`}>Annual</span>
              <span className="ml-2 bg-[#E8F5E9] text-[#4CAF50] text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Plan */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-transform hover:shadow-lg">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-[#212121]">Basic</h2>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-[#212121]">
                    {annual ? "$4.99" : "$5.99"}
                  </span>
                  <span className="ml-1 text-[#616161]">
                    {annual ? "/mo" : "/month"}
                  </span>
                </div>
                {annual && (
                  <p className="text-sm text-[#616161] mt-1">
                    Billed as ${4.99 * 12} annually
                  </p>
                )}
                <div className="mt-6">
                  <Button className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white">
                    Get Started
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-[#616161] mb-4">Includes:</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Activity tracking</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Up to 5 friends</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Basic workout templates</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Token rewards (basic rate)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Join public challenges</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-white border-2 border-[#4CAF50] rounded-xl overflow-hidden transition-transform hover:shadow-lg relative">
              <div className="absolute top-0 right-0 bg-[#4CAF50] text-white text-xs px-3 py-1 rounded-bl-lg">
                MOST POPULAR
              </div>
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-[#212121]">Pro</h2>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-[#212121]">
                    {annual ? "$9.99" : "$12.99"}
                  </span>
                  <span className="ml-1 text-[#616161]">
                    {annual ? "/mo" : "/month"}
                  </span>
                </div>
                {annual && (
                  <p className="text-sm text-[#616161] mt-1">
                    Billed as ${9.99 * 12} annually
                  </p>
                )}
                <div className="mt-6">
                  <Button className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white">
                    Get Started
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-[#616161] mb-4">Everything in Basic, plus:</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Unlimited friends</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Advanced workout analytics</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Create custom challenges</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">2x token rewards</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Personalized workout recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Priority support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-transform hover:shadow-lg">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-[#212121]">Premium</h2>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-[#212121]">
                    {annual ? "$19.99" : "$24.99"}
                  </span>
                  <span className="ml-1 text-[#616161]">
                    {annual ? "/mo" : "/month"}
                  </span>
                </div>
                {annual && (
                  <p className="text-sm text-[#616161] mt-1">
                    Billed as ${19.99 * 12} annually
                  </p>
                )}
                <div className="mt-6">
                  <Button className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white">
                    Get Started
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-[#616161] mb-4">Everything in Pro, plus:</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">3x token rewards</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Exclusive NFT badges</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Early access to new features</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Personal fitness coach (monthly call)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Premium rewards store access</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#4CAF50] mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-[#616161]">Family account (up to 5 members)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-[#212121] mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#F5F5F5] p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#212121] mb-2">Can I cancel my subscription anytime?</h3>
                <p className="text-[#616161]">
                  Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to your plan until the end of your billing period.
                </p>
              </div>
              <div className="bg-[#F5F5F5] p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#212121] mb-2">How do token rewards work?</h3>
                <p className="text-[#616161]">
                  You earn tokens by completing workouts, participating in challenges, and maintaining streaks. These tokens can be redeemed in our reward store for fitness products and discounts.
                </p>
              </div>
              <div className="bg-[#F5F5F5] p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#212121] mb-2">Is there a free trial available?</h3>
                <p className="text-[#616161]">
                  Yes! We offer a 14-day free trial for all new users. You can explore our features before committing to a subscription.
                </p>
              </div>
              <div className="bg-[#F5F5F5] p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#212121] mb-2">Do I need a crypto wallet to use FitConnect?</h3>
                <p className="text-[#616161]">
                  No, you don't need a crypto wallet to start. We maintain an internal token wallet for you. However, connecting an external wallet gives you more flexibility with your tokens.
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center bg-[#E8F5E9] p-8 rounded-xl">
            <h2 className="text-2xl font-bold text-[#212121] mb-4">
              Start your fitness journey today
            </h2>
            <p className="text-[#616161] max-w-2xl mx-auto mb-6">
              Join thousands of users already transforming their fitness experience with FitConnect.
              Try it free for 14 days, no credit card required.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-[#4CAF50] hover:bg-[#388E3C] px-8">
                Start Free Trial
              </Button>
            </Link>
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

export default Pricing;