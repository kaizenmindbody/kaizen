"use client";

import { usePathname } from 'next/navigation';
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

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ScrollToTop />}
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
      <head>
        <script
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAyzilLlWqrZJK6tAysGzr5n2EOZf1mHL4&libraries=places"
          async
          defer
        />
      </head>

      <body className={`bg-[#FCFCFC] dark:bg-black ${merriweather.className}`}>
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

