import toast from 'react-hot-toast';

// Professional toast icons with enhanced design
const ToastIcons = {
  success: (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 shadow-sm">
      <svg
        className="w-5 h-5 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  ),
  error: (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 shadow-sm">
      <svg
        className="w-5 h-5 text-red-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </div>
  ),
  loading: (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 shadow-sm">
      <svg
        className="w-5 h-5 text-blue-600 animate-spin"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  ),
  warning: (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 shadow-sm">
      <svg
        className="w-5 h-5 text-yellow-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
  ),
  info: (
    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 shadow-sm">
      <svg
        className="w-5 h-5 text-blue-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
  ),
};

// Professional toast configurations with enhanced design
export const showToast = {
  success: (message: string, options?: any) => {
    return toast.success(message, {
      duration: 4000,
      icon: ToastIcons.success,
      style: {
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        color: '#065f46',
        padding: '18px 24px',
        borderRadius: '16px',
        border: '1px solid #86efac',
        boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.15), 0 10px 10px -5px rgba(16, 185, 129, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.1)',
        fontWeight: '500',
        fontSize: '15px',
        maxWidth: '420px',
        minWidth: '320px',
        backdropFilter: 'blur(10px)',
        letterSpacing: '-0.01em',
        lineHeight: '1.5',
      },
      ...options,
    });
  },

  error: (message: string, options?: any) => {
    return toast.error(message, {
      duration: 5000,
      icon: ToastIcons.error,
      style: {
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        color: '#991b1b',
        padding: '18px 24px',
        borderRadius: '16px',
        border: '1px solid #fca5a5',
        boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.15), 0 10px 10px -5px rgba(239, 68, 68, 0.1), 0 0 0 1px rgba(239, 68, 68, 0.1)',
        fontWeight: '500',
        fontSize: '15px',
        maxWidth: '420px',
        minWidth: '320px',
        backdropFilter: 'blur(10px)',
        letterSpacing: '-0.01em',
        lineHeight: '1.5',
      },
      ...options,
    });
  },

  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      icon: ToastIcons.loading,
      style: {
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        color: '#1e40af',
        padding: '18px 24px',
        borderRadius: '16px',
        border: '1px solid #93c5fd',
        boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)',
        fontWeight: '500',
        fontSize: '15px',
        maxWidth: '420px',
        minWidth: '320px',
        backdropFilter: 'blur(10px)',
        letterSpacing: '-0.01em',
        lineHeight: '1.5',
      },
      ...options,
    });
  },

  warning: (message: string, options?: any) => {
    return toast(message, {
      duration: 4500,
      icon: ToastIcons.warning,
      style: {
        background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
        color: '#92400e',
        padding: '18px 24px',
        borderRadius: '16px',
        border: '1px solid #fde68a',
        boxShadow: '0 20px 25px -5px rgba(245, 158, 11, 0.15), 0 10px 10px -5px rgba(245, 158, 11, 0.1), 0 0 0 1px rgba(245, 158, 11, 0.1)',
        fontWeight: '500',
        fontSize: '15px',
        maxWidth: '420px',
        minWidth: '320px',
        backdropFilter: 'blur(10px)',
        letterSpacing: '-0.01em',
        lineHeight: '1.5',
      },
      ...options,
    });
  },

  info: (message: string, options?: any) => {
    return toast(message, {
      duration: 4000,
      icon: ToastIcons.info,
      style: {
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        color: '#1e40af',
        padding: '18px 24px',
        borderRadius: '16px',
        border: '1px solid #93c5fd',
        boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)',
        fontWeight: '500',
        fontSize: '15px',
        maxWidth: '420px',
        minWidth: '320px',
        backdropFilter: 'blur(10px)',
        letterSpacing: '-0.01em',
        lineHeight: '1.5',
      },
      ...options,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: any
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        loading: {
          icon: ToastIcons.loading,
          style: {
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            color: '#1e40af',
            padding: '18px 24px',
            borderRadius: '16px',
            border: '1px solid #93c5fd',
            boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)',
            fontWeight: '500',
            fontSize: '15px',
            maxWidth: '420px',
            minWidth: '320px',
            backdropFilter: 'blur(10px)',
            letterSpacing: '-0.01em',
            lineHeight: '1.5',
          },
        },
        success: {
          icon: ToastIcons.success,
          style: {
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            color: '#065f46',
            padding: '18px 24px',
            borderRadius: '16px',
            border: '1px solid #86efac',
            boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.15), 0 10px 10px -5px rgba(16, 185, 129, 0.1), 0 0 0 1px rgba(16, 185, 129, 0.1)',
            fontWeight: '500',
            fontSize: '15px',
            maxWidth: '420px',
            minWidth: '320px',
            backdropFilter: 'blur(10px)',
            letterSpacing: '-0.01em',
            lineHeight: '1.5',
          },
        },
        error: {
          icon: ToastIcons.error,
          style: {
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            color: '#991b1b',
            padding: '18px 24px',
            borderRadius: '16px',
            border: '1px solid #fca5a5',
            boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.15), 0 10px 10px -5px rgba(239, 68, 68, 0.1), 0 0 0 1px rgba(239, 68, 68, 0.1)',
            fontWeight: '500',
            fontSize: '15px',
            maxWidth: '420px',
            minWidth: '320px',
            backdropFilter: 'blur(10px)',
            letterSpacing: '-0.01em',
            lineHeight: '1.5',
          },
        },
        ...options,
      }
    );
  },

  // Dismiss a specific toast or all toasts
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};

// Default export for backward compatibility
export default showToast;
