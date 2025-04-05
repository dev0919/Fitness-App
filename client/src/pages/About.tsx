import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import fitnessLogoSvg from "../assets/fitness-logo.svg";

const About = () => {
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
          <Link href="/about" className="text-[#4CAF50] font-medium text-sm hidden md:inline">
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

      <main className="flex-1 py-12 px-6 md:px-10 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#212121]">About FitConnect</h1>
            <p className="text-[#616161] mt-3 text-lg">
              Transforming fitness through technology and community
            </p>
          </div>

          {/* Mission Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-[#212121] mb-4">Our Mission</h2>
            <p className="text-[#616161] mb-4">
              At FitConnect, we believe that fitness is more than just physical activity—it's a lifestyle that thrives on connection, 
              motivation, and reward. Our mission is to create an ecosystem where fitness enthusiasts of all levels can track their 
              progress, connect with like-minded individuals, and earn tangible rewards for their dedication.
            </p>
            <p className="text-[#616161] mb-4">
              We're pioneering the integration of blockchain technology with fitness tracking to create a transparent, secure, and 
              rewarding experience that goes beyond traditional fitness applications.
            </p>
          </section>

          {/* Story Section */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-[#212121] mb-4">Our Story</h2>
            <p className="text-[#616161] mb-4">
              FitConnect was born out of a simple observation: while there are countless fitness apps available, most focus solely on 
              individual tracking without addressing the social and motivational aspects that drive long-term adherence to fitness goals.
            </p>
            <p className="text-[#616161] mb-4">
              Founded in 2025 by a team of fitness enthusiasts and technology innovators, FitConnect set out to bridge this gap by 
              creating a platform that combines precise fitness tracking with social connectivity and a revolutionary reward system.
            </p>
            <p className="text-[#616161]">
              What started as a small project has grown into a vibrant community of users who not only track their workouts but also 
              motivate each other, participate in challenges, and earn valuable tokens that can be exchanged for real-world rewards.
            </p>
          </section>



          {/* Values Section */}
          <section>
            <h2 className="text-2xl font-bold text-[#212121] mb-6">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#F5F5F5] p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#212121] mb-2">Community First</h3>
                <p className="text-[#616161]">
                  We believe that a supportive community is essential for sustainable fitness progress.
                </p>
              </div>
              <div className="bg-[#F5F5F5] p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#212121] mb-2">Innovation</h3>
                <p className="text-[#616161]">
                  We're constantly pushing the boundaries of what fitness technology can achieve.
                </p>
              </div>
              <div className="bg-[#F5F5F5] p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#212121] mb-2">Accessibility</h3>
                <p className="text-[#616161]">
                  Fitness should be accessible to everyone, regardless of their starting point.
                </p>
              </div>
              <div className="bg-[#F5F5F5] p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-[#212121] mb-2">Transparency</h3>
                <p className="text-[#616161]">
                  We believe in clear, honest communication and practices in everything we do.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-[#212121] mb-4">Ready to join us?</h2>
            <p className="text-[#616161] mb-6">
              Start your fitness journey with a community that supports and rewards your progress.
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

export default About;