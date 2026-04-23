// Modal form for adding new property listings to the inventory
// Validates numeric inputs for price and size before sending to Prisma
// Supports status selection and basic property details

import React, { useState } from 'react';
import { X, Loader2, Home, MapPin, DollarSign, Maximize } from 'lucide-react';
import api from '../utils/api';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPropertyModal = ({ isOpen, onClose, onSuccess }: AddPropertyModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    size: '',
    type: 'APARTMENT',
    status: 'AVAILABLE',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Data normalization for backend/Prisma requirements
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        size: parseFloat(formData.size) || 0,
        images: [] // Placeholder for image upload logic later
      };

      await api.post('/properties', payload);
      
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        title: '',
        location: '',
        price: '',
        size: '',
        type: 'APARTMENT',
        status: 'AVAILABLE',
        description: ''
      });
    } catch (err: any) {
      console.error("Error creating property:", err);
      const errorMsg = err.response?.data?.message || "Failed to create listing. Check your connection.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <Home className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">New Listing</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Property Title</label>
            <input
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
              placeholder="e.g. Luxury Penthouse at Sunset Blvd"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                placeholder="City, Neighborhood"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Price ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  required
                  type="number"
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Size (sqft)</label>
              <div className="relative">
                <Maximize className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  required
                  type="number"
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Type</label>
              <select 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="APARTMENT">Apartment</option>
                <option value="VILLA">Villa</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="LAND">Land</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
              <select 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm font-bold text-green-600"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="AVAILABLE">Available</option>
                <option value="PENDING">Pending</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:bg-purple-400 text-sm font-bold"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;