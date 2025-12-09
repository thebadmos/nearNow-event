/**
 * Header Component
 * 
 * Simple header for NearNow application.
 * Displays the app name and provides a clean navigation experience.
 * Includes mobile hamburger menu button on the right side.
 */

"use client";

import { MapPin, Menu, X } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (isOpen: boolean) => void;
}

export default function Header({ mobileMenuOpen = false, setMobileMenuOpen }: HeaderProps) {
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

        {/* Right side: Tagline (desktop) and Hamburger menu (mobile) */}
        <div className="flex items-center gap-4">
          {/* Tagline - hidden on mobile */}
          <div className="hidden md:block text-sm text-gray-500 italic">
            Discover what's happening near you
          </div>

          {/* Mobile hamburger menu button - only show on mobile */}
          {setMobileMenuOpen && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900 p-2 -mr-2"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}