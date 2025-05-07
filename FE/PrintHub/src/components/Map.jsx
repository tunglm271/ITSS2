import { MapPin } from "lucide-react";
import mapImage from "../assets/map.png";
const Map = () => {
  return (
    <div className="w-full lg:w-2/3 h-[300px] md:h-[400px] lg:h-[calc(100vh-10rem)] bg-gray-200 rounded-lg overflow-hidden relative">
      <img
        src={mapImage}
        alt="Map"
        className="w-full h-full object-cover"
      />
      <div className="absolute top-1/4 left-1/3">
        <div className="text-red-500">
          <MapPin size={24} md:size={32} fill="red" stroke="white" />
        </div>
      </div>
      <div className="absolute top-1/2 left-1/4">
        <div className="text-red-500">
          <MapPin size={24} md:size={32} fill="red" stroke="white" />
        </div>
      </div>
      <div className="absolute top-3/5 left-3/5">
        <div className="text-red-500">
          <MapPin size={24} md:size={32} fill="red" stroke="white" />
        </div>
      </div>
      <div className="absolute top-1/2 left-1/2">
        <div className="text-red-500">
          <MapPin size={24} md:size={32} fill="red" stroke="white" />
        </div>
      </div>
      <div className="absolute top-2/3 right-1/4">
        <div className="text-red-500">
          <MapPin size={24} md:size={32} fill="red" stroke="white" />
        </div>
      </div>
      <div className="absolute top-3/4 right-1/3">
        <div className="text-red-500">
          <MapPin size={24} md:size={32} fill="red" stroke="white" />
        </div>
      </div>
      <div className="absolute top-1/4 right-1/4">
        <div className="text-red-500">
          <MapPin size={24} md:size={32} fill="red" stroke="white" />
        </div>
      </div>
      <div className="absolute top-2/3 left-1/3">
        <div className="text-red-500">
          <MapPin size={24} md:size={32} fill="red" stroke="white" />
        </div>
      </div>
    </div>
  );
};

export default Map;
