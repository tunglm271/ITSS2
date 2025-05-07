import { useState } from "react";
import { Filter as FilterIcon } from "lucide-react";
import Header from "./components/Header";
import Filter from "./components/Filter";
import PrintShopCard from "./components/PrintShopCard";
import ShopDetailDialog from "./components/dialog/ShopDetailDialog";
import Map from "./components/Map";
import { printShops } from "./fakedata.json";
import OrderDialog from "./components/dialog/OrderDialog";

const Home = () => {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [selectedShop, setSelectedShop] = useState(null);
  const [orderShop, setOrderShop] = useState(null);

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
              {printShops.slice(0, 7).map((shop) => (
                <PrintShopCard
                  key={shop.id}
                  shop={shop}
                  onDetailClick={() => setSelectedShop(shop)}
                  onOrderClick={() => setOrderShop(shop)}
                />
              ))}
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
