// this file is the modal form for adding a new lead
// handles both creation (POST) and updates (PUT)

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import api from '../utils/api';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; // Used for editing existing leads
}

const AddLeadModal = ({ isOpen, onClose, onSuccess, initialData }: AddLeadModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    budget: '',
    preference: '',
  });

  // Populate form when initialData changes or modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        budget: initialData.budget?.toString() || '',
        preference: initialData.preference || '',
      });
    } else {
      setFormData({ name: '', email: '', phone: '', budget: '', preference: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Data Normalization: Prisma needs null for empty floats/strings, not empty strings or 0
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        preference: formData.preference.trim() || null,
        // If budget is empty string, send null so Prisma doesn't crash
        budget: formData.budget === '' ? null : parseFloat(formData.budget),
      };

      if (initialData?.id) {
        // EDIT MODE: Use PUT and maintain existing status
        await api.put(`/leads/${initialData.id}`, {
          ...payload,
          status: initialData.status, 
        });
      } else {
        // CREATE MODE: Use POST
        await api.post('/leads', {
          ...payload,
          status: 'NEW', 
        });
      }
      
      onSuccess();
      onClose();
      setFormData({ name: '', email: '', phone: '', budget: '', preference: '' });
    } catch (err: any) {
      console.error("Error saving lead:", err);
      const serverMessage = err.response?.data?.message;
      alert(serverMessage || "Failed to save lead. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                required
                type="text"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
              <input
                type="number"
                step="any"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Preference</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
              placeholder="e.g. 3BHK, Sunset Villa"
              value={formData.preference}
              onChange={(e) => setFormData({ ...formData, preference: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:bg-purple-400"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (initialData ? 'Update Lead' : 'Save Lead')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;