"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const savedProductId = localStorage.getItem("selectedProductId");
    router.replace(savedProductId ? `/${savedProductId}/screenshots` : "/redirect");
  }, [router]);

  return null;
}
