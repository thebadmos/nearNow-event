// src/components/dashboard/MobileMenu.tsx
"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { sidebarLinks } from "./Sidebar";

interface MobileMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden text-gray-600 hover:text-gray-900"
      >
        <span className="sr-only">Open mobile menu</span>
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6" aria-hidden="true" />
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={() => setIsOpen(false)}
          />

          {/* Mobile menu panel */}
          <div className="relative flex h-full w-64 flex-col overflow-y-auto bg-white pb-4 pt-5">
            <div className="px-4">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    NearNow
                  </span>
                </Link>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-1 flex-col">
              <nav className="space-y-1 px-2">
                {sidebarLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <link.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${
                          isActive ? "text-blue-600" : "text-gray-500"
                        }`}
                      />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Mobile menu footer */}
            <div className="border-t border-gray-200 p-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 italic">
                  Discover what's happening near you
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}