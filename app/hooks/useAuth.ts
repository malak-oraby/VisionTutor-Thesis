"use client";

import { useAuth as useAuthContext } from "../context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const auth = useAuthContext();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Enhanced login with form handling
  const handleLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      await auth.login(email, password);
      // If no error thrown, login was successful
      return true;
    } catch (error: any) {
      setFormError(error.message || "Login failed");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced registration with form handling
  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    // Basic validation
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return false;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return false;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      await auth.register(name, email, password);
      // If no error thrown, registration was successful
      return true;
    } catch (error: any) {
      setFormError(error.message || "Registration failed");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logout with redirect
  const handleLogout = async (redirectTo: string = "/login") => {
    try {
      await auth.logout();
      router.push(redirectTo);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Check if user is authenticated and redirect if not
  const requireAuth = (redirectTo: string = "/login") => {
    if (!auth.loading && !auth.user) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  return {
    ...auth,
    formError,
    isSubmitting,
    handleLogin,
    handleRegister,
    handleLogout,
    requireAuth,
  };
}
