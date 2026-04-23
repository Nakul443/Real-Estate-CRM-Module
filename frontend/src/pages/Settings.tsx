// This page handles user preferences and system integrations.
// It allows agents to configure their profile and admins to manage CRM automations.
// Current status: Basic profile and Webhook configuration.

import React, { useState } from 'react';
import { User, Bell, Shield, Globe, Save, Link as LinkIcon } from 'lucide-react';

const Settings = () => {
  const [n8nWebhook, setN8nWebhook] = useState('https://n8n.your-instance.com/webhook/crm-alerts');

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
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'
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
                <input type="text" className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                <input type="email" className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="john@realestate.com" />
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
                value={n8nWebhook}
                onChange={(e) => setN8nWebhook(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm font-mono text-gray-600" 
              />
            </div>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors">
              <Save size={16} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;