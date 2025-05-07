import { Filter as FilterIcon } from "lucide-react";

const Filter = ({ activeFilter, setActiveFilter }) => {
  const filters = ["Tất cả", "Gần đây", "Đánh giá cao", "Giá thấp", "Giá cao"];

  return (
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
        <button className="flex items-center space-x-1 border rounded-md px-3 py-1 hover:bg-gray-100 transition-colors cursor-pointer">
          <span>Sắp xếp theo</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        <button className="flex items-center space-x-1 border rounded-md px-3 py-1 hover:bg-gray-100 transition-colors cursor-pointer">
          <FilterIcon size={16} />
          <span>Bộ lọc</span>
        </button>
      </div>
    </div>
  );
};

export default Filter;
