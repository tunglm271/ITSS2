import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
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

const MapCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const DEFAULT_POSITION = [21.004424, 105.846569];

const Map = ({ shops = [], onRouteCalculated }) => {
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [maneuvers, setManeuvers] = useState([]);

  useEffect(() => {
    setLoading(true);
    const getLocation = async () => {
      try {
        if (navigator.geolocation) {
          const locationPromise = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => resolve(position),
              (error) => reject(error),
              { timeout: 10000, enableHighAccuracy: true }
            );
          });

          try {
            const position = await Promise.race([
              locationPromise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout")), 10000)
              )
            ]);
            
            const { latitude, longitude } = position.coords;
            setCurrentPosition([latitude, longitude]);
            setLoading(false);
          } catch (error) {
            console.error("Error getting location:", error);
            setCurrentPosition(DEFAULT_POSITION);
            setLoading(false);
          }
        } else {
          console.error("Geolocation is not supported by this browser.");
          setCurrentPosition(DEFAULT_POSITION);
          setLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setCurrentPosition(DEFAULT_POSITION);
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (currentPosition && shops.length > 0 && !loading) {
      shops.forEach(shop => {
        if (shop?.latitude && shop?.longitude) {
          calculateDistance(currentPosition, [shop.latitude, shop.longitude], shop.id);
        }
      });
    }
  }, [shops, currentPosition, loading]);

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

  const calculateDistance = async (start, end, shopId) => {
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
      const { summary } = res.data.trip.legs[0];
      const routeInfoData = {
        distance: parseFloat(summary.length.toFixed(2)),
        time: Math.ceil(summary.time / 120),
      };
      
      if (onRouteCalculated) {
        onRouteCalculated(shopId, routeInfoData);
      }
    } catch (error) {
      console.error("Error calculating distance:", error.message);
    }
  };

  const fetchRoute = async (start, end, shopId) => {
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
      const routeInfoData = {
        distance: parseFloat(summary.length.toFixed(2)),
        time: Math.ceil(summary.time / 120),
      };
      
      setRoute(decodedShape);
      setRouteInfo(routeInfoData);
      setManeuvers(maneuvers); // Lưu lại hướng dẫn
      
      if (onRouteCalculated) {
        onRouteCalculated(shopId, routeInfoData);
      }
    } catch (error) {
      console.error("Error fetching route:", error.message);
    }
  };

  const handleShopClick = async (shop) => {
    if (shop?.latitude && shop?.longitude && currentPosition) {
      setSelectedShopId(shop.id); // Lưu lại shop được chọn
      await fetchRoute(currentPosition, [shop.latitude, shop.longitude], shop.id);
    }
  };

  if (loading || !currentPosition) {
    return (
      <div className="w-full lg:w-2/3 z-0 h-[300px] md:h-[400px] lg:h-[calc(100vh)] rounded-lg overflow-hidden flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Đang xác định vị trí của bạn...</div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-2/3 z-0 h-[300px] md:h-[400px] lg:h-[calc(100vh)] rounded-lg overflow-hidden">
      <MapContainer
        center={currentPosition}
        zoom={15}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapCenter center={currentPosition} />
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
