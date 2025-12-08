"use client";

import { ReactNode, useState } from "react";
import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileMenu from "@/components/dashboard/MobileMenu";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <MobileMenu isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
