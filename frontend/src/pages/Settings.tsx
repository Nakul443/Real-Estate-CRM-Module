// This page handles user preferences and system integrations.
// It allows agents to configure their profile and admins to manage CRM automations.
// Current status: Functional profile and Webhook configuration.

import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Globe, Save, Link as LinkIcon, Loader2 } from 'lucide-react';
import api from '../utils/api';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    webhookUrl: ''
  });

  // Fetch current settings on load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          webhookUrl: response.data.webhookUrl || ''
        });
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/settings', formData);
      alert("Settings updated successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500">Manage your profile and third-party integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          {[
            { name: 'Profile', icon: User, active: true },
            { name: 'Notifications', icon: Bell, active: false },
            { name: 'Security', icon: Shield, active: false },
            { name: 'Integrations', icon: Globe, active: false },
          ].map((item) => (
            <button
              key={item.name}
              disabled={!item.active}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active ? 'bg-purple-50 text-purple-600' : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <User size={18} className="text-purple-600" /> Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                <input 
                  type="email" 
                  className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-gray-50" 
                  value={formData.email}
                  disabled // Email usually handled via auth, making it read-only here for safety
                />
              </div>
            </div>
          </div>

          {/* CRM Integrations Section (n8n) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <LinkIcon size={18} className="text-purple-600" /> Automation (n8n)
            </h3>
            <p className="text-xs text-gray-500">Configure your n8n webhook URL to trigger automated email follow-ups for new leads.</p>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">Webhook URL</label>
              <input 
                type="text" 
                value={formData.webhookUrl}
                onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm font-mono text-gray-600" 
              />
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors disabled:bg-purple-400"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;