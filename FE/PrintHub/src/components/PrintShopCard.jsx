import { MapPin, Star, Navigation } from "lucide-react";

const PrintShopCard = ({ shop, onDetailClick, onOrderClick, distance }) => {
  const renderStars = (rating) => {
    const MAX_STARS = 5;
    const stars = [];
    
    for (let i = 0; i < MAX_STARS; i++) {
      const starValue = Math.min(1, Math.max(0, rating - i));
      const percent = Math.round(starValue * 100);
      
      stars.push(
        <div key={i} className="relative inline-block w-4 h-4" style={{ marginRight: '2px' }}>
          <Star 
            size={16} 
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
                size={16} 
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
    <div className="bg-white rounded-lg shadow p-3 border border-gray-100 fade-in">
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
            <div className="flex items-center">
              {renderStars(shop.rating)}
            </div>
            <span className="text-sm font-medium text-amber-500 ml-1">
              {shop.rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500 ml-1">
              ({shop.reviewCount} đánh giá)
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin size={14} className="mr-1" />
            {shop.address}
          </div>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Navigation size={14} className="mr-1" />
            {distance ? `${distance} km` : "Đang tính khoảng cách..."}
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
