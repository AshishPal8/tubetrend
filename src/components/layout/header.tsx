"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

import { usePathname } from "next/navigation";
import { navLinks } from "@/data/header";
import Logo from "./logo";
import NavLinks from "./nav-links";
import UserDropdown from "./user";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [isTop, setIsTop] = useState(true);
  const lastScroll = useRef(0);

  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      if (currentScroll <= 10) {
        setIsTop(true);
        setShowHeader(true);
      } else {
        setIsTop(false);

        if (currentScroll > lastScroll.current) {
          setShowHeader(false);
        } else if (currentScroll < lastScroll.current) {
          setShowHeader(true);
        }
      }

      lastScroll.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isTop ? "bg-transparent backdrop-blur-sm" : "bg-white shadow-md",
        showHeader ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Logo />

          <NavLinks />

          <UserDropdown isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t relative">
          <div
            className="z-10 top-0 left-0 h-screen w-full absolute"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="container bg-white mx-auto px-4 py-4 z-50 absolute">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((nav) => (
                <Link
                  key={nav.href}
                  href={nav.href}
                  className={`px-4 py-3 text-gray-800 hover:bg-green-50 rounded-lg transition-colors 
                    ${
                      pathname === nav.href
                        ? "bg-green-600 text-white font-extrabold"
                        : "text-gray-800"
                    }
                    `}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {nav.title}
                </Link>
              ))}
              <Link
                href="/dashboard"
                className="px-4 py-3 text-gray-800 hover:bg-green-50 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
