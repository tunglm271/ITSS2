import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { DivIcon } from "leaflet";

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

const Map = () => {
  const [currentPosition, setCurrentPosition] = useState([21.004424, 105.846569]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition([latitude, longitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const markers = [
    { id: 1, position: [21.005, 105.847], name: "Shop 1" },
    { id: 2, position: [21.006, 105.848], name: "Shop 2" },
    { id: 3, position: [21.007, 105.849], name: "Shop 3" },
    { id: 4, position: [21.008, 105.850], name: "Shop 4" },
    { id: 5, position: [21.009, 105.851], name: "Shop 5" },
    { id: 6, position: [21.010, 105.852], name: "Shop 6" },
    { id: 7, position: [21.011, 105.853], name: "Shop 7" },
    { id: 8, position: [21.012, 105.854], name: "Shop 8" },
    { id: 9, position: [21.013, 105.855], name: "Shop 9" },
    { id: 10, position: [21.014, 105.856], name: "Shop 10" },
  ];

  const createShopIcon = (name) => {
    return new DivIcon({
      html: `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
        ">
          <img 
            src="/shop_40505.png" 
            alt="Shop" 
            style="width: 32px; height: 32px;" 
          />
          <span style="
            background-color: white;
            color: #000;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
            white-space: nowrap;
          ">${name}</span>
        </div>
      `,
      className: "",
    });
  };

  return (
    <div className="w-full lg:w-2/3 h-[300px] md:h-[400px] lg:h-[calc(100vh-10rem)] rounded-lg overflow-hidden">
      <MapContainer center={currentPosition} zoom={16} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={currentPosition}>
          <Popup>Vị trí của bạn</Popup>
        </Marker>

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={createShopIcon(marker.name)}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
