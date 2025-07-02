import SearchResult from "@/components/search/searchResult";
import React, { Suspense } from "react";

const Search = () => {
  return (
    <Suspense fallback={<div className="mt-20 text-center">Loading…</div>}>
      <SearchResult />
    </Suspense>
  );
};

export default Search;
