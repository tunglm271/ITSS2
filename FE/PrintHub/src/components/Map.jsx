import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { DivIcon } from "leaflet";
import axios from "axios";
import polyline from "@mapbox/polyline"; // Import polyline decoder

// Fix icon issue for default marker
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});



const Map = ({ shops = [] }) => {
  const [currentPosition, setCurrentPosition] = useState([21.004424, 105.846569]);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedShopId, setSelectedShopId] = useState(null); // Thêm state này
  const [maneuvers, setManeuvers] = useState([]); // Thêm state này

  const createShopIcon = () => {
    return new DivIcon({
      html: `
        <div style="display: flex; align-items: center; justify-content: center;">
          <img 
            src="/shop_40505.png" 
            alt="Shop" 
            style="width: 32px; height: 32px;" 
            onerror="this.style.display='none';"
          />
        </div>
      `,
      className: "",
    });
  };

  const fetchRoute = async (start, end) => {
    const body = {
      locations: [
        { lat: start[0], lon: start[1] },
        { lat: end[0], lon: end[1] },
      ],
      costing: "pedestrian",
      directions_options: { units: "kilometers" },
    };

    try {
      const res = await axios.post(
        `https://valhalla1.openstreetmap.de/route`,
        body
      );
      const { shape, summary, maneuvers } = res.data.trip.legs[0];
      const decodedShape = polyline.decode(shape, 6);
      setRoute(decodedShape);
      setRouteInfo({
        distance: summary.length.toFixed(2),
        time: Math.ceil(summary.time / 120),
      });
      setManeuvers(maneuvers); // Lưu lại hướng dẫn
    } catch (error) {
      console.error("Error fetching route:", error.message);
    }
  };

  const handleShopClick = async (shop) => {
    if (shop?.latitude && shop?.longitude) {
      setSelectedShopId(shop.id); // Lưu lại shop được chọn
      await fetchRoute(currentPosition, [shop.latitude, shop.longitude]);
    }
  };

  return (
    <div className="w-full lg:w-2/3 z-0 h-[300px] md:h-[400px] lg:h-[calc(100vh)] rounded-lg overflow-hidden">
      <MapContainer
        center={currentPosition}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={currentPosition}>
          <Popup>Vị trí của bạn</Popup>
        </Marker>

        {shops.map((shop) => (
          <Marker
            key={shop.id}
            position={[shop.latitude, shop.longitude]}
            icon={createShopIcon()}
            eventHandlers={{
              click: () => handleShopClick(shop),
            }}
          >
            <Popup>
              <div>
                <div className="font-bold">{shop.name}</div>
                {selectedShopId === shop.id && routeInfo && (
                  <div>
                    <div>Quãng đường: {routeInfo.distance} km</div>
                    <div>Thời gian di chuyển: {routeInfo.time} phút</div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {route && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
};

export default Map;
