import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/data/header";

function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex items-center space-x-10">
      {navLinks.map((nav) => (
        <Link
          key={nav.title}
          href={nav.href}
          className={`hover:text-primary font-medium transition-colors ${
            pathname === nav.href
              ? "text-primary font-extrabold"
              : "text-gray-800"
          }`}
        >
          {nav.title}
        </Link>
      ))}
    </nav>
  );
}

export default NavLinks;
