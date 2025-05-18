import { Search, Heart, User } from "lucide-react";
import { useState } from "react";

const Header = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        onSearch(value);
      }, 300);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      clearTimeout(window.searchTimeout);
      onSearch(searchTerm);
    }
  };

  return (
    <div className="mb-5 w-full">
      <div className="flex justify-between items-center py-4 px-4">
        <p className="text-3xl font-bold text-blue-600">PrintHub</p>
        <div className="flex items-center relative w-1/2">
          <Search size={16} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
          />
          {searchTerm && (
            <button 
              className="absolute right-3 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setSearchTerm("");
                if (onSearch) onSearch("");
              }}
            >
              ✕
            </button>
          )}
        </div>
        <div className="flex space-x-4">
          <button className="text-gray-600">
            <Heart size={20} />
          </button>
          <button className="text-gray-600">
            <User size={20} />
          </button>
        </div>
      </div>
      <div className="border-b border-gray-200"></div>
    </div>
  );
};

export default Header;
