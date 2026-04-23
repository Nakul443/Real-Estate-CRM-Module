// handles the display and management of property listings
// connects to the backend to fetch real-time inventory, pricing, and status
// uses the first image from the storage array as the cover

import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Tag, Plus, MoreVertical, Loader2, Edit, Trash2 } from 'lucide-react';
import api from '../utils/api';
// We need to import a modal here! (I'll assume you create AddPropertyModal.tsx next)
import AddPropertyModal from '../components/AddPropertyModal'; 

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state added

  // --- NEW STATE FOR DROPDOWN CONTROL ---
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // --- NEW STATE FOR EDITING ---
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Fetch properties from the backend
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await api.get('/properties');
      setProperties(response.data);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // --- DELETE LOGIC ---
  const handleDeleteProperty = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this listing? Associated deals will be unlinked.")) {
      try {
        await api.delete(`/properties/${id}`);
        fetchProperties(); // Refresh the list
        setActiveMenuId(null);
      } catch (error: any) {
        console.error("Delete error:", error);
        alert(error.response?.data?.message || "Failed to delete property.");
      }
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-orange-100 text-orange-700';
      case 'SOLD': return 'bg-red-100 text-red-700';
      case 'RENTED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Listings</h1>
          <p className="text-gray-500">Manage your inventory and availability.</p>
        </div>
        {/* ADDED onClick handler */}
        <button 
          onClick={() => {
            setSelectedProperty(null); // Clear selection for "New" mode
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          <span>New Listing</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 text-purple-600">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p className="text-gray-500 text-sm">Loading inventory...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any) => (
            <div key={property.id} className="bg-white rounded-xl border border-gray-200 overflow-visible shadow-sm hover:shadow-md transition-shadow">
              <div className="h-48 overflow-hidden relative bg-gray-100 rounded-t-xl">
                {property.images && property.images.length > 0 ? (
                  <img 
                    src={property.images[0]} 
                    alt={property.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Building2 size={48} />
                  </div>
                )}
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm uppercase tracking-wider ${getStatusStyle(property.status)}`}>
                  {property.status}
                </span>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 truncate max-w-[200px]">{property.title}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <span className="shrink-0"><MapPin size={14} /></span> {property.location}
                    </p>
                  </div>
                  
                  {/* --- DROPDOWN ACTION MENU --- */}
                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === property.id ? null : property.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeMenuId === property.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                          <button 
                            onClick={() => {
                              setSelectedProperty(property);
                              setIsModalOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-bold text-gray-700 hover:bg-purple-50 flex items-center gap-2"
                          >
                            <Edit size={14} /> Edit Listing
                          </button>
                          <button 
                            onClick={() => handleDeleteProperty(property.id)}
                            className="w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-2 text-purple-600 font-bold">
                    <Tag size={18} />
                    <span>${property.price.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {property.size} sqft • {property.type}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && properties.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500">No properties found. Start by adding your first listing!</p>
        </div>
      )}

      {/* MODAL INTEGRATION */}
      <AddPropertyModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }} 
        onSuccess={fetchProperties}
        initialData={selectedProperty}
      />
    </div>
  );
};

export default Properties;