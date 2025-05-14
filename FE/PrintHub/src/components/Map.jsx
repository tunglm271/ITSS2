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

const Map = ({ shops }) => {
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

  const createShopIcon = () => {
    return new DivIcon({
      html: `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <img 
            src="/shop_40505.png" 
            alt="Shop" 
            style="width: 32px; height: 32px;" 
          />
        </div>
      `,
      className: "",
    });
  };

  return (
    <div className="w-full lg:w-2/3 z-0 h-[300px] md:h-[400px] lg:h-[calc(100vh)] rounded-lg overflow-hidden">
      <MapContainer center={currentPosition} zoom={20} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={currentPosition}>
          <Popup>Vị trí của bạn</Popup>
        </Marker>

        {shops &&
          shops.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={createShopIcon()}
            >
              <Popup>{marker.name}</Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default Map;
