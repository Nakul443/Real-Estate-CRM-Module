// table that lists leads with their status, contact info and assigned agent
// now connected to the Express/Prisma backend
// includes search filtering and loading states

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MoreVertical, Plus, Search, Loader2 } from 'lucide-react';
import api from '../utils/api'; // Ensure you have created the api utility in src/utils/api.ts

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real leads from the backend on component mount
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await api.get('/leads');
        setLeads(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching leads:", err);
        setError("Failed to load leads. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Filter logic for the search bar
  const filteredLeads = leads.filter((lead: any) => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-700';
      case 'QUALIFIED': return 'bg-green-100 text-green-700';
      case 'CLOSED': return 'bg-purple-100 text-purple-700';
      case 'LOST': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-500">Track and manage your property inquiries from the database.</p>
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

      {/* Leads Table Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-purple-600">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="text-gray-500 animate-pulse text-sm">Fetching leads...</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Contact</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Preferences</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLeads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Mail size={14} /> {lead.email || 'N/A'}</span>
                        <span className="flex items-center gap-1 mt-1"><Phone size={14} /> {lead.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                         {lead.preference || 'General Inquiry'}
                         {lead.budget && <div className="text-xs text-purple-600 font-bold mt-1">Budget: ${lead.budget.toLocaleString()}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(lead.status)}`}>
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
                No leads found.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Leads;