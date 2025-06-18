"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
      <Toaster position="top-center" richColors />
    </SessionProvider>
  );
}
