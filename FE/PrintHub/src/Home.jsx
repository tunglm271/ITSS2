import { useState, useEffect, useMemo, useCallback } from "react";
import { Filter as FilterIcon } from "lucide-react";
import Header from "./components/Header";
import Filter from "./components/Filter";
import PrintShopCard from "./components/PrintShopCard";
import ShopDetailDialog from "./components/dialog/ShopDetailDialog";
import Map from "./components/Map";
import OrderDialog from "./components/dialog/OrderDialog";
import api from "./services/api";
const SHOPS_PER_PAGE = 4;

const Home = () => {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedShop, setSelectedShop] = useState(null);
  const [orderShop, setOrderShop] = useState(null);
  const [shops, setShops] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [shopDistances, setShopDistances] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredShops = useMemo(() => {
    if (!searchTerm.trim()) return shops;
    
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    return shops.filter(shop => 
      shop.name.toLowerCase().includes(lowerSearchTerm) || 
      shop.address.toLowerCase().includes(lowerSearchTerm)
    );
  }, [shops, searchTerm]);

  const sortedShops = useMemo(() => {
    const shopsWithDistance = filteredShops.map(shop => ({
      ...shop,
      distance: shopDistances[shop.id] || Number.MAX_VALUE
    }));
    
    if (activeFilter === "Gần đây") {
      return shopsWithDistance.sort((a, b) => {
        return a.distance - b.distance;
      });
    } else if (activeFilter === "Đánh giá cao") {
      return shopsWithDistance.sort((a, b) => {
        if (b.rating !== a.rating) {
          return b.rating - a.rating; 
        } 
        return a.distance - b.distance; 
      });
    }
    
    return shopsWithDistance;
  }, [filteredShops, activeFilter, shopDistances]);

  const totalPages = useMemo(() => 
    Math.ceil(sortedShops.length / SHOPS_PER_PAGE),
    [sortedShops.length]
  );
  
  const paginatedShops = useMemo(() => 
    sortedShops.slice(
      (currentPage - 1) * SHOPS_PER_PAGE,
      currentPage * SHOPS_PER_PAGE
    ),
    [sortedShops, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get("/shops")
      .then((response) => {
        setShops(response.data);
      })
      .catch(error => {
        console.error("Error fetching shops:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateShopDistance = useCallback((shopId, routeInfo) => {
    if (routeInfo && routeInfo.distance) {
      setShopDistances(prev => {
        if (!prev[shopId] || prev[shopId] !== routeInfo.distance) {
          return {
            ...prev,
            [shopId]: routeInfo.distance
          };
        }
        return prev;
      });
    }
  }, []);

  return (
    <div className="w-screen min-h-screen bg-white pb-10">
      <Header onSearch={handleSearch} />

      {/* Filters */}
      <div className="container mx-auto px-4">
        <Filter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        {searchTerm && (
          <div className="mt-2 mb-3 text-gray-600">
            Kết quả tìm kiếm cho: <span className="font-medium">"{searchTerm}"</span>
            <span className="ml-2 text-sm">({sortedShops.length} cửa hàng)</span>
            {sortedShops.length === 0 && (
              <div className="mt-2 text-gray-500">
                Không tìm thấy cửa hàng phù hợp với từ khóa bạn tìm kiếm.
              </div>
            )}
          </div>
        )}

        {/* Map and List */}
        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          {loading ? (
            <div className="w-full lg:w-2/3 z-0 h-[300px] md:h-[400px] lg:h-[calc(100vh)] rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : (
            <Map 
              shops={sortedShops} 
              onRouteCalculated={updateShopDistance}
            />
          )}

          {/* List of Print Shops */}
          <div className="w-full lg:w-1/3 space-y-4 mt-4 lg:mt-0">
            {loading ? (
              <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow border border-gray-100">
                Đang tải dữ liệu cửa hàng...
              </div>
            ) : sortedShops.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                  {paginatedShops.map((shop) => (
                    <PrintShopCard
                      key={shop.id}
                      shop={shop}
                      distance={shopDistances[shop.id]}
                      onDetailClick={() => setSelectedShop(shop)}
                      onOrderClick={() => setOrderShop(shop)}
                    />
                  ))}
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    <button
                      className="px-3 py-1 rounded border cursor-pointer border-gray-300 bg-white hover:bg-gray-200"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        className={`px-3 py-1 rounded border cursor-pointer border-gray-300 ${
                          currentPage === i + 1
                            ? "bg-blue-500 text-white"
                            : "bg-white hover:bg-gray-200"
                        }`}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="px-3 py-1 rounded border border-gray-300 cursor-pointer bg-white hover:bg-gray-200"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow border border-gray-100">
                Không tìm thấy cửa hàng nào phù hợp với từ khóa "{searchTerm}".
                <br />
                Hãy thử tìm kiếm với từ khóa khác.
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedShop && (
        <ShopDetailDialog
          shop={selectedShop}
          onClose={() => setSelectedShop(null)}
        />
      )}
      {orderShop && (
        <OrderDialog
          open={!!orderShop}
          shop={orderShop}
          onClose={() => setOrderShop(null)}
        />
      )}
    </div>
  );
};

export default Home;
