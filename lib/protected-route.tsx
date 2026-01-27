// components/auth/protected-route.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { admin, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.admin
  );

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accesstoken")
        : null;

    // Wait for redux + persist hydration
    if (token && loading && !admin) return;

    if (!token || !isAuthenticated || !admin) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [admin, isAuthenticated, loading, router]);

  if (!ready) return null;

  return <>{children}</>;
}
