import React from "react";
import SearchInput from "@/components/ui/search-input";

const CategoryFilters = () => {
  return (
    <div className="flex items-center justify-between">
      <SearchInput />
      <div>Filters</div>
    </div>
  );
};

export default CategoryFilters;
