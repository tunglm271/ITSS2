import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
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
const DISTANCE_CACHE_KEY = 'printhub_distance_cache';
const POSITION_CACHE_KEY = 'printhub_user_position';
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;
const MAX_POSITION_DIFF = 100;

const Map = forwardRef(({ shops = [], onRouteCalculated }, ref) => {
  const [loading, setLoading] = useState(true);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [route, setRoute] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [maneuvers, setManeuvers] = useState([]);
  const [calculatingDistances, setCalculatingDistances] = useState(false);
  const [processedShopIds, setProcessedShopIds] = useState(new Set());
  const [failedShopIds, setFailedShopIds] = useState(new Set());
  const retryTimeoutRef = useRef(null);
  const [positionChanged, setPositionChanged] = useState(false);
  const [mapKey, setMapKey] = useState(Date.now());

  useImperativeHandle(ref, () => ({
    refreshDistances: () => {
      localStorage.removeItem(DISTANCE_CACHE_KEY);
      setProcessedShopIds(new Set());
      setFailedShopIds(new Set());
      setPositionChanged(true);
      setMapKey(Date.now()); 
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const newPosition = [latitude, longitude];
            setCurrentPosition(newPosition);
            localStorage.setItem(POSITION_CACHE_KEY, JSON.stringify({
              position: newPosition,
              timestamp: Date.now()
            }));
          },
          (error) => {
            console.error("Error refreshing position:", error);
          }
        );
      }
    }
  }));

  useEffect(() => {
    setLoading(true);
    
    try {
      const cachedPositionData = localStorage.getItem(POSITION_CACHE_KEY);
      if (cachedPositionData) {
        const { position, timestamp } = JSON.parse(cachedPositionData);
        if (Date.now() - timestamp < CACHE_EXPIRATION) {
          console.log("Using cached position", position);
          setCurrentPosition(position);
          setPositionChanged(false);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error("Error reading cached position:", error);
    }
    
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
            const newPosition = [latitude, longitude];
            
            try {
              const cachedPositionData = localStorage.getItem(POSITION_CACHE_KEY);
              if (cachedPositionData) {
                const { position: oldPosition } = JSON.parse(cachedPositionData);
                if (!isNearby(oldPosition, newPosition)) {
                  setPositionChanged(true);
                  localStorage.removeItem(DISTANCE_CACHE_KEY);
                }
              } else {
                setPositionChanged(true);
              }
            } catch (e) {
              console.error("Error comparing positions:", e);
            }
            
            try {
              localStorage.setItem(POSITION_CACHE_KEY, JSON.stringify({
                position: newPosition,
                timestamp: Date.now()
              }));
            } catch (e) {
              console.error("Error saving position to cache:", e);
            }
            
            setCurrentPosition(newPosition);
            setLoading(false);
          } catch (error) {
            console.error("Error getting location:", error);
            setCurrentPosition(DEFAULT_POSITION);
            setPositionChanged(true);
            setLoading(false);
          }
        } else {
          console.error("Geolocation is not supported by this browser.");
          setCurrentPosition(DEFAULT_POSITION);
          setPositionChanged(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setCurrentPosition(DEFAULT_POSITION);
        setPositionChanged(true);
        setLoading(false);
      }
    };

    getLocation();
  }, [mapKey]);

  const isNearby = (pos1, pos2) => {
    if (!pos1 || !pos2) return false;
    
    const lat1 = pos1[0];
    const lon1 = pos1[1];
    const lat2 = pos2[0];
    const lon2 = pos2[1];
    
    const R = 6371000; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance < MAX_POSITION_DIFF;
  };

  useEffect(() => {
    if (!currentPosition || loading) return;
    
    if (!positionChanged) {
      try {
        const cachedData = localStorage.getItem(DISTANCE_CACHE_KEY);
        if (cachedData) {
          const { distances, timestamp } = JSON.parse(cachedData);
          
          if (Date.now() - timestamp < CACHE_EXPIRATION) {
            console.log("Using cached distances:", Object.keys(distances).length);
            
            Object.entries(distances).forEach(([shopId, routeInfo]) => {
              if (onRouteCalculated && routeInfo) {
                onRouteCalculated(parseInt(shopId, 10), routeInfo);
              }
              
              setProcessedShopIds(prev => {
                const newSet = new Set(prev);
                newSet.add(parseInt(shopId, 10));
                return newSet;
              });
            });
          }
        }
      } catch (e) {
        console.error("Error loading cached distances:", e);
      }
    }
  }, [currentPosition, loading, onRouteCalculated, positionChanged]);

  useEffect(() => {
    const calculateAllDistances = async () => {
      if (!currentPosition || loading || calculatingDistances) return;
      
      setCalculatingDistances(true);
      
      const unprocessedShops = shops.filter(shop => 
        shop?.latitude && 
        shop?.longitude && 
        !processedShopIds.has(shop.id) &&
        !failedShopIds.has(shop.id)
      );
      
      if (unprocessedShops.length === 0) {
        setCalculatingDistances(false);
        
        if (failedShopIds.size > 0 && !retryTimeoutRef.current) {
          retryTimeoutRef.current = setTimeout(() => {
            setFailedShopIds(new Set());
            retryTimeoutRef.current = null;
          }, 5000);
        }
        return;
      }
      
      const BATCH_SIZE = 2;
      let successfulDistances = {};
      let newFailedIds = new Set();
      let newProcessedIds = new Set(processedShopIds);
      
      for (let i = 0; i < unprocessedShops.length; i += BATCH_SIZE) {
        const batch = unprocessedShops.slice(i, i + BATCH_SIZE);
        
        try {
          const results = await Promise.all(
            batch.map(async (shop) => {
              try {
                const routeInfo = await calculateDistance(
                  currentPosition, 
                  [shop.latitude, shop.longitude], 
                  shop.id
                );
                
                if (routeInfo) {
                  return { success: true, shopId: shop.id, routeInfo };
                } else {
                  return { success: false, shopId: shop.id };
                }
              } catch (error) {
                console.error(`Error calculating distance for shop ${shop.id}:`, error);
                return { success: false, shopId: shop.id };
              }
            })
          );
          
          results.forEach(result => {
            if (result.success) {
              newProcessedIds.add(result.shopId);
              successfulDistances[result.shopId] = result.routeInfo;
            } else {
              newFailedIds.add(result.shopId);
            }
          });
          
        } catch (error) {
          console.error("Batch processing error:", error);
          batch.forEach(shop => newFailedIds.add(shop.id));
        }
        
        if (i + BATCH_SIZE < unprocessedShops.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      setProcessedShopIds(newProcessedIds);
      setFailedShopIds(new Set([...failedShopIds, ...newFailedIds]));
      
      if (Object.keys(successfulDistances).length > 0) {
        try {
          const cachedData = localStorage.getItem(DISTANCE_CACHE_KEY);
          let existingDistances = {};
          
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            existingDistances = parsed.distances || {};
          }
          
          const updatedDistances = { ...existingDistances, ...successfulDistances };
          
          localStorage.setItem(DISTANCE_CACHE_KEY, JSON.stringify({
            distances: updatedDistances,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.error("Error saving distances to cache:", e);
        }
      }
      
      setCalculatingDistances(false);
    };
    
    calculateAllDistances();
    
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [
    shops, 
    currentPosition, 
    loading, 
    calculatingDistances, 
    processedShopIds, 
    failedShopIds, 
    onRouteCalculated
  ]);

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
      
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
      
      return routeInfoData;
    } catch (error) {
      console.error("Error calculating distance:", error.message);
      return null;
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
      
      try {
        const cachedData = localStorage.getItem(DISTANCE_CACHE_KEY);
        let existingDistances = {};
        
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          existingDistances = parsed.distances || {};
        }
        
        existingDistances[shopId] = routeInfoData;
        
        localStorage.setItem(DISTANCE_CACHE_KEY, JSON.stringify({
          distances: existingDistances,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error("Error updating cache with route:", e);
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
          shop?.latitude && shop?.longitude ? (
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
          ) : null
        ))}

        {route && <Polyline positions={route} color="blue" />}
      </MapContainer>
    </div>
  );
});

export default Map;
