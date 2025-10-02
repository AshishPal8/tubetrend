import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Input } from "./input";

const SearchInput = () => {
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const [searchValue, setSearchValue] = useState(initialSearch);

  useEffect(() => {
    // debounce logic
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (searchValue) {
        params.set("search", searchValue);
      } else {
        params.delete("search");
      }

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    }, 300);

    return () => clearTimeout(handler); // cleanup on value change
  }, [searchValue, searchParams]);

  return (
    <div className="w-full">
      <Input
        placeholder="Search with category name"
        className="w-full md:w-[30%]"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
    </div>
  );
};

export default SearchInput;
