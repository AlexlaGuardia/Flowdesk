"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function VerifyPage() {
  return <Suspense><VerifyInner /></Suspense>;
}

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Invalid or missing token");
      return;
    }

    fetch(`/api/auth/verify?token=${token}`, { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || "Verification failed");
        }
        await refresh();
        router.push("/dashboard");
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [searchParams, router, refresh]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment">
        <div className="text-center">
          <p className="text-void-red font-medium">{error}</p>
          <a href="/login" className="mt-4 inline-block text-sm text-stamp-600 hover:text-stamp-700">
            Try again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-parchment">
      <p className="text-ink-500">Verifying...</p>
    </div>
  );
}
