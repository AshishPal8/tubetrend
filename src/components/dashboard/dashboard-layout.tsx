import React from "react";
import { DashSidebar } from "./dash-sidebar";

export default function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex">
      <div className="flex w-72 flex-col fixed inset-y-0">
        <DashSidebar />
      </div>
      <main className="md:pl-72 flex-1 overflow-y-auto bg-[#F9F9F9]">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
