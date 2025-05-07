import { Search, Heart, User } from "lucide-react";

const Header = () => {
  return (
    <div className="mb-5 w-full">
      <div className="flex justify-between items-center py-4 px-4">
        <p className="text-3xl font-bold text-blue-600">PrintHub</p>
        <div className="flex items-center relative w-1/2">
          <Search size={16} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm cửa hàng in..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
