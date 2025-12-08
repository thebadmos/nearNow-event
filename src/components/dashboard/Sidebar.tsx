// src/components/dashboard/Sidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Home, 
  Heart,
  MapPin
} from "lucide-react";

export interface SidebarLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// NearNow Navigation Links
// Simplified to just the essential pages for event discovery
export const sidebarLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Discover Events", icon: Home },
  { href: "/dashboard/my-events", label: "My Events", icon: Heart },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-white lg:block">
      {/* Rest of the Sidebar component implementation remains the same */}
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NearNow
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-4 space-y-1 px-2">
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

      {/* Tagline at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 italic">
            Discover what's happening near you
          </p>
        </div>
      </div>
    </aside>
  );
}