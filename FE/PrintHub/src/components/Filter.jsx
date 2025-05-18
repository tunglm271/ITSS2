import { Filter as FilterIcon } from "lucide-react";
import { useState } from "react";

const Filter = ({ activeFilter, setActiveFilter }) => {
  const filters = ["Tất cả", "Gần đây", "Đánh giá cao"];

  return (
    <div className="flex items-center mb-4 space-x-2 overflow-x-auto">
      <div className="flex space-x-2">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`py-1 px-4 rounded-full text-sm transition-colors cursor-pointer whitespace-nowrap ${
              activeFilter === filter
                ? "bg-blue-100 text-blue-500 hover:bg-blue-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Filter;
