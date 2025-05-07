import { MapPin, Star } from "lucide-react";

const PrintShopCard = ({ shop, onDetailClick, onOrderClick }) => {
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i < rating ? "#FFD700" : "none"}
          color={i < rating ? "#FFD700" : "#D1D5DB"}
          className="inline-block"
        />
      );
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-lg shadow p-3 border border-gray-100">
      <div className="flex space-x-3">
        {shop.image && (
          <img
            src={shop.image}
            alt={shop.name}
            className="w-16 h-16 rounded-md object-cover"
          />
        )}
        <div className="flex-1">
          <h3 className="font-semibold">{shop.name}</h3>
          <div className="flex items-center">
            {renderStars(shop.rating)}
            <span className="text-sm text-gray-500 ml-1">
              ({shop.reviewCount} đánh giá)
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin size={14} className="mr-1" />
            {shop.address}
          </div>
          <div className="flex mt-2 space-x-2">
            <button
              className="bg-blue-500 text-white rounded-md px-3 py-1 text-sm hover:bg-blue-600 transition-colors cursor-pointer"
              onClick={onOrderClick}
            >
              Đặt đơn
            </button>
            <button
              className="border border-gray-300 rounded-md px-3 py-1 text-sm hover:bg-gray-100 transition-colors cursor-pointer"
              onClick={onDetailClick}
            >
              Chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintShopCard;
