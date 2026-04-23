/**
 * PROPERTY MAP INTEGRATION
 * Features:
 * - Interactive map visualization of all 'AVAILABLE' properties.
 * - Custom markers showing price and property title.
 * - Dynamic centering based on property coordinates.
 * - Links directly back to property details.
 */

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Home, DollarSign, ExternalLink, Loader2 } from 'lucide-react';
import api from '../utils/api';

// Fix for default Leaflet icon path issues in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Property {
  id: string;
  title: string;
  price: number;
  latitude: number;
  longitude: number;
  status: string;
}

const PropertyMap = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get('/properties');
        // Only map properties that have valid coordinates
        const validProps = res.data.filter((p: Property) => p.latitude && p.longitude);
        setProperties(validProps);
      } catch (err) {
        console.error("Map Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) return (
    <div className="flex justify-center p-20 text-purple-600">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  // Default center (can be set to user's location or city center)
  const defaultCenter: [number, number] = properties.length > 0 
    ? [properties[0].latitude, properties[0].longitude] 
    : [40.7128, -74.0060]; // NYC Default

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Property Map Explorer</h1>
        <p className="text-gray-500">Geographic distribution of active listings.</p>
      </div>

      <div className="h-[70vh] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg z-0">
        <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {properties.map((prop) => (
            <Marker key={prop.id} position={[prop.latitude, prop.longitude]}>
              <Popup className="rounded-xl overflow-hidden">
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-gray-900">{prop.title}</h3>
                  <div className="flex items-center text-purple-600 font-bold mt-1">
                    <DollarSign size={14} />
                    <span>{prop.price.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                    <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-bold">
                      {prop.status}
                    </span>
                    <button 
                      onClick={() => window.location.href = `/properties/${prop.id}`}
                      className="flex items-center gap-1 text-purple-600 hover:underline font-medium"
                    >
                      Details <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default PropertyMap;