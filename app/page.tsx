"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, User, LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const words = ["Coding", "Math", "Learning"];
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [fadeState, setFadeState] = useState("in"); // 'in', 'out'
  const [opacity, setOpacity] = useState(1);
  const [blur, setBlur] = useState(0);

  // Word animation effect
  useEffect(() => {
    const wordInterval = setInterval(() => {
      // Start fade out
      setFadeState("out");
      setOpacity(0);
      setBlur(8);

      // Change word and fade in after animation completes
      setTimeout(() => {
        setCurrentWord((prev) => {
          const currentIndex = words.indexOf(prev);
          return words[(currentIndex + 1) % words.length];
        });
        setFadeState("in");
        setOpacity(1);
        setBlur(0);
      }, 1000); // Half of the total transition time
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(wordInterval);
  }, []);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check authentication status on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/auth/me", {
          credentials: "include", // Important for sending cookies
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
        } else {
          // User is not logged in, clear any stale data
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setError("Failed to verify authentication status");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignUp = () => {
    router.push("/register");
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        setIsLoggedIn(false);
        setIsProfileOpen(false);

        // Optional: Show a success message or redirect
        router.push("/"); // Refresh the home page
      } else {
        console.error("Logout failed");
        setError("Failed to log out. Please try again.");
      }
    } catch (err) {
      console.error("Logout error:", err);
      setError("An error occurred during logout");
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "U";

    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#040922] text-white">
      {/* Navigation */}
      <header
        className={`fixed w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "py-2 bg-gray-800/80 backdrop-blur-md mx-auto px-4 rounded-full max-w-5xl left-1/2 -translate-x-1/2 shadow-lg mt-2 border border-gray-700/30"
            : "py-4 bg-transparent w-full"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <div className="text-3xl font-bold text-white cursor-pointer">
                  VisionTutor
                </div>
              </Link>
            </div>

            {/* Center Navigation Links - Desktop */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 space-x-10">
              <a
                href="#home"
                className="text-white hover:text-blue-400 transition text-lg font-medium"
              >
                Home
              </a>
              <a
                href="#use-case"
                className="text-white hover:text-blue-400 transition text-lg font-medium"
              >
                Use Cases
              </a>
              <a
                href="#about"
                className="text-white hover:text-blue-400 transition text-lg font-medium"
              >
                About
              </a>
            </div>

            {/* Right Side - Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={toggleProfile}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {getUserInitials()}
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-white" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-700/50">
                      <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm font-medium text-white">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {user?.email || ""}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                      >
                        <User size={16} className="mr-2" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left block px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={handleLogin}
                    className="px-6 py-2 rounded-full text-white hover:text-blue-300 transition text-lg font-medium"
                  >
                    Log In
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition text-lg font-medium border border-white/30"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="focus:outline-none text-white"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800/90 backdrop-blur-md mt-4 rounded-lg shadow-lg p-4 border border-gray-700/30">
            <div className="flex flex-col space-y-4">
              <a
                href="#home"
                className="text-white hover:text-blue-400 transition py-2 text-lg"
              >
                Home
              </a>
              <a
                href="#use-case"
                className="text-white hover:text-blue-400 transition py-2 text-lg"
              >
                Use Cases
              </a>
              <a
                href="#about"
                className="text-white hover:text-blue-400 transition py-2 text-lg"
              >
                About
              </a>

              {loading ? (
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin self-center my-2"></div>
              ) : isLoggedIn ? (
                <>
                  {user && (
                    <div className="py-2 border-t border-gray-700 mt-2">
                      <p className="text-sm font-medium text-white">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email || ""}
                      </p>
                    </div>
                  )}
                  <Link
                    href="/dashboard"
                    className="text-white hover:text-blue-400 transition py-2 flex items-center text-lg"
                  >
                    <User size={18} className="mr-2" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-white hover:text-blue-400 transition py-2 flex items-center text-lg"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3 border-t border-gray-700 pt-4 mt-2">
                  <button
                    onClick={handleLogin}
                    className="px-6 py-2 text-white hover:text-blue-300 transition text-lg font-medium"
                  >
                    Log In
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition text-lg font-medium border border-white/30"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-red-500/90 text-white px-4 py-2 rounded-md flex items-center max-w-md">
            <AlertCircle className="mr-2" size={16} />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-25 relative overflow-hidden">
        {/* Background video with darker overlay */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            className="w-full h-full object-cover z-0 "
          >
            <source src="/hero.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Darker overlay gradient with shadow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50 z-10 shadow-inner"></div>

        {/* Corner shadows */}
        <div className="absolute inset-0 shadow-[inset_0_0_150px_100px_rgba(0,0,0,0.7)] z-10"></div>

        {/* Main content */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Funding badge */}
            <div className="inline-block px-4 py-2 bg-blue-900/50 rounded-full mb-6 backdrop-blur-sm border border-blue-700/30">
              <p className="text-blue-300 font-medium">Levelling up</p>
            </div>

            {/* Main heading with animated text - increased font size */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8 font-manrope text-white">
              <span
                className="relative inline-block mr-3"
                style={{ transform: "rotate(-4deg)", display: "inline-block" }}
              >
                <span className="absolute inset-0 bg-white opacity-18 rounded-xl border border-white/10 -z-10 p-9"></span>
                <span className="relative px-4 py-4">Vision</span>
              </span>

              <span className="bg-clip-text text-white">AI to Help with </span>

              <span className="relative inline-block">
                <span
                  className="inline-block font-bold bg-clip-text text-transparent bg-gradient-to-t from-gray-300 to-white pb-3"
                  style={{
                    whiteSpace: "nowrap",
                    transition: "opacity 1s ease, filter 1s ease",
                    opacity: opacity,
                    filter: `blur(${blur}px)`,
                  }}
                >
                  {currentWord}
                </span>
              </span>
            </h1>

            {/* Subtitle - formatted to two lines with max width */}
            <p className="text-xl md:text-2xl text-gray-300 mb-10 mx-auto leading-normal">
              VisionTutor is an intelligent learning assistant that helps you
              <br />
              master coding and math with personalized, interactive guidance.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                variant="secondary"
                size="lg"
                className="text-lg px-6 py-4 font-semibold transition-transform hover:scale-105 shadow-md"
                onClick={() =>
                  isLoggedIn ? router.push("/code") : handleLogin()
                }
              >
                Try VisionCode
              </Button>
              <Button
                variant="default"
                size="lg"
                className="gradient-border text-lg px-6 py-4 font-semibold transition-transform hover:scale-105 shadow-md"
                onClick={() =>
                  isLoggedIn ? router.push("/math") : handleLogin()
                }
              >
                Try VisionMath
              </Button>
            </div>
          </div>

          {/* Showcase area with tilted glassy container */}
        </div>
      </section>

      {/* Features Section */}
      <section
        id="use-case"
        className="py-24 bg-gradient-to-br from-[#0b0a1f] to-[#0a0a25] text-white relative overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold tracking-tight mb-6 text-white text-transparent bg-clip-text">
              Supercharge Your Learning
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Our AI-powered tools adapt to your learning style and needs,
              providing personalized assistance in both coding and mathematics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Feature Card */}
            {[
              {
                title: "Smart Code Editor",
                description:
                  "Get real-time assistance as you code with intelligent suggestions, error detection, and guided learning paths tailored to your skill level.",
                image: "/codeeditor.png",
                iconColor: "text-blue-400",
                bgColor: "bg-blue-600/20",
                link: "/code",
                linkText: "Try Code Editor",
              },
              {
                title: "Interactive Math Canvas",
                description:
                  "Solve complex mathematical problems with our AI-powered canvas that recognizes handwritten equations and provides step-by-step solutions.",
                image: "/canvas.png",
                iconColor: "text-purple-400",
                bgColor: "bg-purple-600/20",
                link: "/math",
                linkText: "Try Math Canvas",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-gradient-to-br from-[#111] to-[#1a1a2f] rounded-3xl p-8 border border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-transform transform hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className={`${feature.bgColor} rounded-full p-4`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-10 w-10 ${feature.iconColor}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {feature.title.includes("Code") ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="rounded-3xl overflow-hidden border border-white/10 shadow-inner">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                    <div className="mt-6">
                      <button
                        onClick={() =>
                          isLoggedIn ? router.push(feature.link) : handleLogin()
                        }
                        className={`inline-flex items-center text-sm font-semibold ${feature.iconColor} hover:opacity-80 transition`}
                      >
                        {feature.linkText}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 ml-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="about"
        className="py-20 bg-gradient-to-br from-[#0b0a1f] to-[#0a0a25] relative"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Learning Experience?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join thousands of students and professionals using VisionTutor to
              accelerate their learning journey.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                variant="secondary"
                size="lg"
                className="text-lg px-6 py-4 font-semibold transition-transform hover:scale-105 shadow-md"
                onClick={
                  isLoggedIn ? () => router.push("/dashboard") : handleSignUp
                }
              >
                {isLoggedIn ? "Go to Dashboard" : "Get Started for free"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 pt-16 pb-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-8 mb-16">
            <div className="md:col-span-2">
              <div className="text-3xl font-bold text-blue-400 mb-4">
                VisionTutor
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                An AI-powered learning platform that adapts to your learning
                style and helps you master coding and mathematics.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-400">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-400">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    Updates
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-500 text-center">
              © {new Date().getFullYear()} VisionTutor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
