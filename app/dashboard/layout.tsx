"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Fixed missing import
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";
import type { DashboardLayoutProps } from "@/lib/types";
import { useAppDispatch } from "@/hooks/redux-hooks";
import { fetchAdminData } from "@/redux/slices/admin-slice";
import { fetchMenuItems } from "@/redux/slices/menu-slice";
import { fetchAllCustomers } from "@/redux/slices/customer-slice";

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter(); // ✅ Added router

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(fetchAdminData()).unwrap();
        await dispatch(fetchMenuItems()).unwrap();
        await dispatch(fetchAllCustomers()).unwrap();
      } catch (error) {
        router.push("/login"); // redirect if not authenticated
      }
    };
    checkAuth();
  }, [dispatch, router]);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
