/**
 * Header Component
 * 
 * Simple header for NearNow application.
 * Displays the app name and provides a clean navigation experience.
 */

"use client";

import { MapPin } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo/Brand */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NearNow
          </span>
        </Link>

        {/* Tagline */}
        <div className="hidden md:block text-sm text-gray-500 italic">
          Discover what's happening near you
        </div>
      </div>
    </header>
  );
}