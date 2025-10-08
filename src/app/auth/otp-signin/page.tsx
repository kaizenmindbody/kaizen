"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const OTPSigninPage = () => {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        router.push('/admin');
        return;
      }

      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        router.push(redirectUrl);
      } else {
        router.push('/profile');
      }
    }
  }, [user, loading, isAdmin, router]);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          // Don't include emailRedirectTo - this forces OTP code instead of magic link
        }
      });

      if (error) throw error;

      setMessage('Check your email for the 6-digit OTP code!');
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      });

      if (error) throw error;

      // Success - redirect will happen via AuthContext useEffect
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          // Don't include emailRedirectTo - this forces OTP code instead of magic link
        }
      });

      if (error) throw error;

      setMessage('New OTP code sent to your email!');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
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
    return null; // Will redirect
  }

  return (
    <div className="font-sans min-h-screen bg-gray-50 flex items-center justify-center pt-[80px] sm:pt-[120px] pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-left">
          <h1 className="text-3xl font-bold text-[#012047] mb-2">
            {step === 'email' ? 'Sign In with OTP' : 'Verify OTP'}
          </h1>
          <p className="text-[#465D7C]">
            {step === 'email'
              ? 'Enter your email to receive a one-time password'
              : 'Enter the 6-digit code sent to your email'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-700 text-sm">{message}</p>
          </div>
        )}

        {/* Email Step */}
        {step === 'email' && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#012047] mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                'Send OTP Code'
              )}
            </button>

            {/* Alternative Sign In Options */}
            <div className="space-y-3">
              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-secondary hover:text-green-700"
                >
                  Sign in with password instead
                </Link>
              </div>

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
            </div>
          </form>
        )}

        {/* OTP Verification Step */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-[#012047] mb-2">
                OTP Code <span className="text-red-500">*</span>
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                autoComplete="one-time-code"
              />
              <p className="mt-2 text-xs text-gray-500 text-center">
                Code sent to {email}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                'Verify OTP'
              )}
            </button>

            {/* Resend and Back Options */}
            <div className="space-y-3">
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-sm text-secondary hover:text-green-700 disabled:text-gray-400"
                >
                  Didn&apos;t receive code? Resend OTP
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOTP('');
                    setError('');
                    setMessage('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Change email address
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OTPSigninPage;
