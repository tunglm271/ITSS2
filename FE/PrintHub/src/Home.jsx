import { useState } from "react";
import { Filter as FilterIcon } from "lucide-react";
import Header from "./components/Header";
import Filter from "./components/Filter";
import PrintShopCard from "./components/PrintShopCard";
import ShopDetailDialog from "./components/dialog/ShopDetailDialog";
import Map from "./components/Map";
import { printShops } from "./fakedata.json";
import OrderDialog from "./components/dialog/OrderDialog";

const SHOPS_PER_PAGE = 5;

const Home = () => {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedShop, setSelectedShop] = useState(null);
  const [orderShop, setOrderShop] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(printShops.length / SHOPS_PER_PAGE);
  const paginatedShops = printShops.slice(
    (currentPage - 1) * SHOPS_PER_PAGE,
    currentPage * SHOPS_PER_PAGE
  );

  return (
    <div className="w-screen min-h-screen bg-white pb-10">
      <Header />

      {/* Filters */}
      <div className="container mx-auto px-4">
        <Filter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

        {/* Map and List */}
        <div className="flex flex-col lg:flex-row gap-4 mt-4">
          <Map />

          {/* List of Print Shops */}
          <div className="w-full lg:w-1/3 space-y-4 mt-4 lg:mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {paginatedShops.map((shop) => (
                <PrintShopCard
                  key={shop.id}
                  shop={shop}
                  onDetailClick={() => setSelectedShop(shop)}
                  onOrderClick={() => setOrderShop(shop)}
                />
              ))}
            </div>
            {/* Pagination Controls */}
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
