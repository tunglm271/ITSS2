import { X, MapPin, Phone, Mail, Clock, Tag } from "lucide-react";

const ShopDetailDialog = ({ shop, onClose }) => (
  <div
    className="fixed inset-0 bg-gray-200/75 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Chi tiết cửa hàng</h2>
        <button
          onClick={onClose}
          className="rounded-full cursor-pointer p-2 hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <hr className="mb-4" />
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            <span className="font-semibold">Tên cửa hàng</span>
          </div>
          <div className="ml-7">{shop.name}</div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold">Địa chỉ</span>
          </div>
          <div className="ml-7">{shop.address}</div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            <span className="font-semibold">Bảng giá</span>
          </div>
          <div className="ml-7 text-blue-600 cursor-pointer">Xem bảng giá</div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Giờ mở cửa</span>
          </div>
          <div className="ml-7">{shop.openTime}</div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <span className="font-semibold">Số điện thoại</span>
          </div>
          <div className="ml-7">{shop.phone}</div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <span className="font-semibold">Email</span>
          </div>
          <div className="ml-7">{shop.email}</div>
        </div>
      </div>
      <div className="flex gap-2 mt-6">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-400 rounded-lg py-2 cursor-pointer hover:bg-gray-100"
        >
          Đóng
        </button>
        <a
          href={`tel:${shop.phone || "0909123456"}`}
          className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-center cursor-pointer hover:bg-gray-700"
        >
          Gọi ngay
        </a>
      </div>
    </div>
  </div>
);

export default ShopDetailDialog;
