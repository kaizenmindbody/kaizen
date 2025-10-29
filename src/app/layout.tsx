"use client";

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import Footer from "@/components/footer";
import Header from "@/components/header";
import ScrollToTop from "@/components/scroll-tops";
import { Merriweather } from "next/font/google";
import "../styles/index.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const merriweather = Merriweather({ 
  subsets: ["latin"],
  weight: ["400"]
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const isProfileRoute = pathname?.startsWith('/profile');

  return (
    <>
      {!isAdminRoute && !isProfileRoute && <Header />}
      {children}
      {!isAdminRoute && !isProfileRoute && <Footer />}
      {!isAdminRoute && !isProfileRoute && <ScrollToTop />}
    </>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.js. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />

      <body className={`bg-[#FCFCFC] dark:bg-black ${merriweather.className}`}>
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&loading=async`}
            strategy="afterInteractive"
            onLoad={() => {
              console.log('Google Maps API loaded successfully');
            }}
            onError={(e) => {
              console.error('Failed to load Google Maps script:', e);
              console.error('Check: 1) API key is valid, 2) Domain is whitelisted in Google Cloud Console, 3) Billing is enabled');
            }}
          />
        ) : (
          <script dangerouslySetInnerHTML={{
            __html: `console.error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. Check your Vercel environment variables.');`
          }} />
        )}
        <Providers>
          <LayoutContent>
            {children}
          </LayoutContent>
        </Providers>
      </body>
    </html>
  );
}

import { Providers } from "./providers";

