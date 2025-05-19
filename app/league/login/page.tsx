"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LeagueLoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new unified signin page
    router.push("/auth/signin?callbackUrl=/league");
  }, [router]);

  return null;
}