"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "@/store";
import { PrimeReactProvider } from 'primereact/api';
import '@/styles/toast.css';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PrimeReactProvider>
        <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              reverseOrder={false}
              gutter={16}
              containerStyle={{
                bottom: 24,
                right: 24,
              }}
              toastOptions={{
                // Default options - Professional design
                duration: 4000,
                className: 'professional-toast',
                style: {
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                  color: '#1f2937',
                  padding: '18px 24px',
                  borderRadius: '16px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                  fontSize: '15px',
                  fontWeight: '500',
                  maxWidth: '420px',
                  minWidth: '320px',
                  backdropFilter: 'blur(10px)',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.5',
                },
                // Success toasts - Professional green
                success: {
                  duration: 4000,
                  style: {
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    color: '#065f46',
                    border: '1px solid #86efac',
                    boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.15), 0 10px 10px -5px rgba(16, 185, 129, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.1)',
                    backdropFilter: 'blur(10px)',
                  },
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                // Error toasts - Professional red
                error: {
                  duration: 5000,
                  style: {
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                    color: '#991b1b',
                    border: '1px solid #fca5a5',
                    boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.15), 0 10px 10px -5px rgba(239, 68, 68, 0.1), 0 0 0 1px rgba(239, 68, 68, 0.1)',
                    backdropFilter: 'blur(10px)',
                  },
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
                // Loading toasts - Professional blue
                loading: {
                  style: {
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    color: '#1e40af',
                    border: '1px solid #93c5fd',
                    boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)',
                    backdropFilter: 'blur(10px)',
                  },
                  iconTheme: {
                    primary: '#3b82f6',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </PrimeReactProvider>
    </Provider>
  );
}
