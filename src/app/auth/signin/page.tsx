"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { useSignIn } from '@/hooks/useSignIn';

const SigninPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { user, loading, isAdmin, userProfile } = useAuth();
  const { signIn, isLoading } = useSignIn();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      // Check if there's a redirect URL stored in localStorage
      const redirectUrl = localStorage.getItem('redirectAfterLogin');

      if (redirectUrl) {
        // Clear the stored redirect URL
        localStorage.removeItem('redirectAfterLogin');
        // Redirect to the intended page
        router.push(redirectUrl);
        return;
      }

      // Wait for userProfile to be loaded before making type-based redirect decisions
      // If userProfile is undefined/null, it's still being fetched - don't redirect yet
      if (!userProfile && !isAdmin) {
        return; // Wait for profile to load
      }

      // Redirect based on user type
      if (isAdmin) {
        router.push('/admin');
      } else if (userProfile?.user_type === 'eventhost') {
        router.push('/eventhost');
      } else if (userProfile?.user_type === 'practitioner') {
        router.push('/profile');
      } else {
        // Default redirect to profile
        router.push('/profile');
      }
    }
  }, [user, loading, isAdmin, userProfile, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors({});

    const result = await signIn({
      email: formData.email,
      password: formData.password,
    });

    if (!result.success) {
      setErrors({ general: result.error || 'An unexpected error occurred. Please try again.' });
      return;
    }

    // Successful login - redirect to the appropriate page
    if (result.redirectPath) {
      router.push(result.redirectPath);
    }
  };

  if (loading) {
    return (
      <div className="font-sans min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="font-sans min-h-screen bg-gray-50 flex items-center justify-center pt-[80px] sm:pt-[120px] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#012047] mb-2">
            Sign In
          </h1>
          <p className="text-[#465D7C]">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#012047] mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#012047] mb-2">
              <div className="flex items-center justify-between">
                <div>
                  Password <span className="text-red-500">*</span>
                </div>
                <div>
                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-secondary hover:text-green-700"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </div>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L7.5 7.5m2.378 2.378L12 12m0 0l2.122 2.122m0 0L16.5 16.5m-2.378-2.378L12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          {/* OTP Sign In Option */}
          <div className="text-center">
            <Link
              href="/auth/otp-signin"
              className="text-sm text-secondary hover:text-green-700"
            >
              Sign in with OTP instead
            </Link>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/signup"
                className="font-medium text-[#0E82FD] hover:text-blue-400"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SigninPage;