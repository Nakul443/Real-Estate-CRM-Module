// table that lists leads with their status, contact info and assigned agent
// also has a search bar to filter leads by name or email
// covers lead management and agent panel features

import React, { useState } from 'react';
import { Mail, Phone, MoreVertical, Plus, Search } from 'lucide-react';

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const leads = [
    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1 234 567', status: 'New', property: 'Sunset Villa' },
    { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', phone: '+1 987 654', status: 'Contacted', property: 'Oak Ridge Apt' },
    { id: 3, name: 'Mike Ross', email: 'mike@example.com', phone: '+1 555 019', status: 'Qualified', property: 'Downtown Studio' },
  ];

  // Filter logic for the search bar
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-700';
      case 'Contacted': return 'bg-yellow-100 text-yellow-700';
      case 'Qualified': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-500">Track and manage your property inquiries.</p>
        </div>
        <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <Plus size={20} />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Search Bar Area */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search by name or email..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Property</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{lead.name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Mail size={14} /> {lead.email}</span>
                    <span className="flex items-center gap-1 mt-1"><Phone size={14} /> {lead.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{lead.property}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLeads.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No leads found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;