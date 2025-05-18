import { X } from "lucide-react";

const FilterDialog = ({ isOpen, onClose, onApply }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-200/75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-xl font-semibold">Bộ lọc</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto flex-grow custom-scrollbar pr-2">
          {/* Price Range */}
          <div>
            <h3 className="font-medium mb-2">Khoảng giá</h3>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Từ"
                className="w-full p-2 border rounded-md"
              />
              <input
                type="number"
                placeholder="Đến"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="font-medium mb-2">Đánh giá</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>{rating} sao trở lên</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="font-medium mb-2">Danh mục</h3>
            <div className="space-y-2">
              {["Tài liệu", "Ảnh", "Bản vẽ", "Khác"].map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onApply}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Áp dụng
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDialog;
