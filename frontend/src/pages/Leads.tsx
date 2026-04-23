// table that lists leads with their status, contact info and assigned agent
// now connected to the Express/Prisma backend
// includes search filtering and loading states
// also includes modal integration for adding new leads

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MoreVertical, Plus, Search, Loader2, AlertCircle, Filter } from 'lucide-react';
import api from '../utils/api'; // Ensure you have created the api utility in src/utils/api.ts
import AddLeadModal from '../components/AddLeadModal'; // IMPORTANT: New Modal Import

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NEW STATE FOR MODAL CONTROL ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch real leads from the backend on component mount
  // Moved into a named function so we can trigger a refresh after adding a lead
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leads');
      setLeads(response.data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching leads:", err);
      setError(err.response?.data?.message || "Failed to load leads. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Filter logic for the search bar
  const filteredLeads = leads.filter((lead: any) => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (lead.phone && lead.phone.includes(searchTerm))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CONTACTED': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'QUALIFIED': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'PROPOSAL': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'NEGOTIATION': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'CLOSED': return 'bg-green-100 text-green-700 border-green-200';
      case 'LOST': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage your property inquiries from the database.</p>
        </div>
        {/* OPEN MODAL ON CLICK */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all shadow-md shadow-purple-100 font-medium"
        >
          <Plus size={20} />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Search Bar Area */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Leads Table Content */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-purple-600 bg-white">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="text-gray-500 font-medium animate-pulse text-sm">Fetching leads...</p>
          </div>
        ) : error ? (
          <div className="p-16 text-center bg-red-50/50">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={40} />
            <h3 className="text-red-800 font-bold">Error Loading Data</h3>
            <p className="text-red-600 mt-1 text-sm">{error}</p>
            <button 
              onClick={fetchLeads}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors text-xs font-bold"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Lead Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Preferences</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="font-bold text-gray-900">{lead.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs text-gray-500 gap-1">
                          <span className="flex items-center gap-1"><Mail size={12} className="text-gray-400" /> {lead.email || 'N/A'}</span>
                          <span className="flex items-center gap-1"><Phone size={12} className="text-gray-400" /> {lead.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-[200px] truncate">
                           {lead.preference || 'General Inquiry'}
                           {lead.budget && (
                             <div className="text-[10px] text-purple-600 font-bold mt-1 uppercase tracking-tight">
                               Budget: ${lead.budget.toLocaleString()}
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors">
                          <MoreVertical size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredLeads.length === 0 && (
              <div className="p-20 text-center text-gray-500">
                <div className="mb-2 text-gray-300 flex justify-center">
                   <Search size={48} />
                </div>
                <p className="font-medium text-gray-400">No leads found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- ADD LEAD MODAL COMPONENT --- */}
      <AddLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchLeads} // Triggers data re-fetch on success
      />
    </div>
  );
};

export default Leads;