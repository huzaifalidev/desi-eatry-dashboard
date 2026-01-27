"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import type { DashboardLayoutProps } from "@/lib/types";
import ProtectedRoute from "@/lib/protected-route";

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
