// handles the display and management of property listings
// includes status (Available, Sold, Pending) and pricing
// allows agents to see the current inventory at a glance

import React from 'react';
import { Building2, MapPin, Tag, Plus, MoreVertical } from 'lucide-react';

const Properties = () => {
  // Mock data for the property listings
  const properties = [
    {
      id: 1,
      title: 'Sunset Villa',
      location: 'Malibu, CA',
      price: '$2,500,000',
      status: 'Available',
      type: 'Luxury Villa',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 2,
      title: 'Oak Ridge Apartment',
      location: 'Austin, TX',
      price: '$450,000',
      status: 'Pending',
      type: 'Apartment',
      image: 'https://images.unsplash.com/photo-1515263487990-61b0981693d7?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 3,
      title: 'Downtown Studio',
      location: 'Chicago, IL',
      price: '$320,000',
      status: 'Sold',
      type: 'Studio',
      image: 'https://images.unsplash.com/photo-1536376074432-8f240d76b6e4?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-orange-100 text-orange-700';
      case 'Sold': return 'bg-red-100 text-red-700';
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
        <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <Plus size={20} />
          <span>New Listing</span>
        </button>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-48 overflow-hidden relative">
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-full object-cover"
              />
              <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${getStatusStyle(property.status)}`}>
                {property.status}
              </span>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{property.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {property.location}
                  </p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={20} />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-600 font-bold">
                  <Tag size={18} />
                  <span>{property.price}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {property.type}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Properties;