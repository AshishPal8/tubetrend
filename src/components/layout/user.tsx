"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface UserDropdownProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}

function UserDropdown({ isMenuOpen, setIsMenuOpen }: UserDropdownProps) {
  const { data: session } = useSession();
  return (
    <div className="flex items-center space-x-6">
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={session.user?.image || ""}
                  alt={session.user?.name}
                />
                <AvatarFallback className="text-xs">
                  {session.user?.name?.[0]?.toUpperCase() || "B"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href="/profile" className="cursor-pointer">
              <DropdownMenuItem>{session.user?.name}</DropdownMenuItem>
            </Link>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="flex items-center cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => signOut()}
              className="cursor-pointer"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button asChild>
          <Link href="/signin">Sign In</Link>
        </Button>
      )}

      <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <Menu className="h-6 w-6" />
      </button>
    </div>
  );
}

export default UserDropdown;
