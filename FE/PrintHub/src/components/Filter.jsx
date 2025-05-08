import { Filter as FilterIcon } from "lucide-react";
import { useState } from "react";
import FilterDialog from "./dialog/FilterDialog";

const Filter = ({ activeFilter, setActiveFilter }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const filters = ["Tất cả", "Gần đây", "Đánh giá cao", "Giá thấp", "Giá cao"];

  const handleApplyFilters = () => {
    // TODO: Implement filter logic
    setIsDialogOpen(false);
  };

  return (
    <>
      <div className="flex items-center mb-4 space-x-2">
        <div className="flex space-x-2">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`py-1 px-4 rounded-full text-sm transition-colors cursor-pointer ${
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
        <div className="flex ml-auto space-x-2">
          <button
            className="flex items-center space-x-1 border rounded-md px-3 py-1 hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => setIsDialogOpen(true)}
          >
            <FilterIcon size={16} />
            <span>Bộ lọc</span>
          </button>
        </div>
      </div>

      <FilterDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onApply={handleApplyFilters}
      />
    </>
  );
};

export default Filter;
