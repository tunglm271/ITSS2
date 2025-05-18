import { X, MapPin, Phone, Mail, Clock, Tag, Star } from "lucide-react";

const ShopDetailDialog = ({ shop, onClose }) => {
  const renderStars = (rating) => {
    const MAX_STARS = 5;
    const stars = [];
    
    for (let i = 0; i < MAX_STARS; i++) {
      const starValue = Math.min(1, Math.max(0, rating - i));
      const percent = Math.round(starValue * 100);
      
      stars.push(
        <div key={i} className="relative inline-block w-[18px] h-[18px]" style={{ marginRight: '2px' }}>
          <Star 
            size={18} 
            className="absolute top-0 left-0" 
            fill="#D1D5DB" 
            color="#D1D5DB" 
          />
          
          {percent > 0 && (
            <div 
              className="absolute top-0 left-0 overflow-hidden" 
              style={{ width: `${percent}%`, height: '100%' }}
            >
              <Star 
                size={18} 
                fill="#FFD700" 
                color="#FFD700" 
              />
            </div>
          )}
        </div>
      );
    }
    
    return stars;
  };

  return (
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
              <Star className="w-5 h-5" />
              <span className="font-semibold">Đánh giá</span>
            </div>
            <div className="ml-7 flex items-center">
              <div className="flex items-center mr-2">
                {renderStars(shop.rating)}
              </div>
              <span className="text-amber-500 font-medium">{shop.rating}</span>
              <span className="text-gray-500 ml-1">
                ({shop.reviewCount} đánh giá)
              </span>
            </div>
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
};

export default ShopDetailDialog;
