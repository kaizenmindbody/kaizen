"use client";

import React, { useState, useEffect } from 'react';

interface GoogleReviewsProps {
  embedUrl?: string;
  title?: string;
  height?: string;
}

const GoogleReviews: React.FC<GoogleReviewsProps> = ({
  embedUrl,
  title = "What Our Patients Say",
  height = "350px"
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Only set up timer if embedUrl is provided
    if (!embedUrl) return;

    // Set a timeout to show fallback if iframe doesn't load properly
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [embedUrl]);

  // Don't render if no embedUrl is provided
  if (!embedUrl) {
    return null;
  }

  // Extract Google Business/Maps URL from embed URL if possible
  const getGoogleBusinessUrl = (embedUrl: string) => {
    // Try to extract business info from various embed URL patterns
    const patterns = [
      /maps\/embed\/v1\/place\?.*?q=([^&]+)/,
      /maps\/place\/([^/]+)/,
      /business\/([^/]+)/
    ];

    for (const pattern of patterns) {
      const match = embedUrl.match(pattern);
      if (match) {
        const businessName = decodeURIComponent(match[1].replace(/\+/g, ' '));
        return `https://www.google.com/search?q=${encodeURIComponent(businessName + ' reviews')}`;
      }
    }

    // Fallback to generic Google search
    return 'https://www.google.com/search?q=reviews';
  };

  const handleIframeError = () => {
    setIframeError(true);
    setShowFallback(true);
  };

  const googleBusinessUrl = getGoogleBusinessUrl(embedUrl);

  if (showFallback || iframeError) {
    return (
      <section className="relative w-full py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {title && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            </div>
          )}
          <div className="relative h-full w-full pt-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Read Our Reviews
                </h3>
                <p className="text-gray-600 mb-6">
                  See what our patients are saying about their experience with our practice.
                </p>
              </div>
              <a
                href={googleBusinessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                View Reviews on Google
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {title && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
          </div>
        )}
        <div className="relative h-full w-full pt-8">
          <iframe
            style={{
              width: "1px",
              minWidth: "100%",
              height: height,
              border: "none"
            }}
            data-default-styles="width: 1px; min-width: 100%; height: 0px; border: none;"
            src={embedUrl}
            id="googleReviewsIframe"
            title="Google Reviews"
            loading="lazy"
            onError={handleIframeError}
          />
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;