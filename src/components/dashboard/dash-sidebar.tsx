"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { routes } from "@/data/dashboard/sidebar";

export function DashSidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white relative z-10">
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center space-x-3 mb-5">
          <h1>Admin Dashboard</h1>
        </Link>
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                asChild
                variant={pathname === route.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start font-base",
                  pathname === route.href
                    ? "bg-primary hover:bg-primary text-white font-bold"
                    : "hover:bg-primary hover:text-white"
                )}
              >
                <Link href={route.href}>
                  <route.icon className="h-8 w-8 mr-3" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
      <div className="px-3 py-2">
        <Button
          onClick={() => signOut()}
          variant="ghost"
          className="w-full justify-start hover:bg-primary hover:text-white "
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
