"use client";

import React from "react";
import Image from "next/image";
import { BrowseShopProps } from "@/types/homepage";

// Skeleton Loading Component
const ShopSkeleton = ({ variant = "left" }: { variant?: "left" | "right" }) => {
  if (variant === "left") {
    return (
      <div className="flex flex-col h-full animate-pulse">
        <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700 mb-6"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="flex-1"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 ml-auto"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 animate-pulse">
      <div className="flex-1">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 ml-auto"></div>
      </div>
      <div className="w-1/2 h-40 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
};

const BrowseShop = ({ title, shops, loading }: BrowseShopProps & { loading?: boolean }) => {
  // Split shops: first one for left side, rest for right side
  const leftShop = shops?.[0];
  const rightShops = shops?.slice(1, 3) || [];

  return (
    <section className="">
      <div className="container mx-auto">
        {/* Section Title */}
        <h2 className="text-[28px] md:text-[32px] text-primary leading-tight mt-20 mb-12">
          {title}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <ShopSkeleton variant="left" />
            <div className="flex flex-col gap-8 h-full">
              <ShopSkeleton variant="right" />
              <ShopSkeleton variant="right" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            {/* Left Side - First Shop */}
            {leftShop && (
              <div className="flex flex-col">
                <div className="relative rounded-lg overflow-hidden bg-gray-100 mb-6 h-64">
                  <Image
                    src={leftShop.image}
                    alt={leftShop.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold mb-4">
                  {leftShop.title}
                </h3>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors w-fit ml-auto">
                  Shop Now
                </button>
              </div>
            )}

            {/* Right Side - Remaining Shops */}
            <div className="flex flex-col gap-8">
              {rightShops.map((shop) => (
                <div key={shop.id} className="flex items-end gap-6">
                  <div className="flex-1 flex flex-col justify-between h-40">
                    <h3 className="text-xl md:text-2xl font-semibold">
                      {shop.title}
                    </h3>
                    <button className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors w-fit ml-auto">
                      Shop Now
                    </button>
                  </div>
                  <div className="w-1/2 h-40 relative rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={shop.image}
                      alt={shop.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BrowseShop;
