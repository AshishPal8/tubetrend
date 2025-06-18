import Link from "next/link";
import React from "react";

function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center space-x-3">
      <h1 className="text-2xl text-primary font-bold">Daily Drift</h1>
    </Link>
  );
}

export default Logo;
