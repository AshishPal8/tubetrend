"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface SearchPanelProps {
  showSearchPanel: boolean;
  setShowSearchPanel: (show: boolean) => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  showSearchPanel,
  setShowSearchPanel,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  if (!showSearchPanel) return null;

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchPanel(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div
      className="absolute inset-0 z-20 bg-black/40"
      onClick={() => setShowSearchPanel(false)}
    >
      <div
        className="container mx-auto bg-white h-[50vh] rounded-b-2xl shadow-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Search News</h2>
        <div className="flex">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by title, category, content..."
            className="w-full border px-4 py-2 rounded-lg shadow-sm"
          />
          <Button onClick={handleSearch} className="-ml-3">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;
