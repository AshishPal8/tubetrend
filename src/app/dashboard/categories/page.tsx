import React from "react";
import { CategoryClient } from "./components/client";

export default async function Categories() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4">
        <CategoryClient />
      </div>
    </div>
  );
}
