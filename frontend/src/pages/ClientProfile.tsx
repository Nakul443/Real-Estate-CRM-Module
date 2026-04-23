/**
 * CLIENT PROFILE & INTERACTION TIMELINE
 * This file manages individual buyer/seller profiles and their history.
 * Features:
 * - Displays client contact info and type (Buyer/Seller).
 * - Activity Timeline: Visual history of Calls, SMS, and Emails.
 * - Quick Action Log: Form to add new interactions directly to the timeline.
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  User, Mail, Phone, Calendar, Clock, 
  MessageSquare, PhoneCall, Mail as MailIcon, 
  Plus, Loader2, ChevronRight 
} from 'lucide-react';
import api from '../utils/api';

interface Interaction {
  id: string;
  type: string; // 'Call', 'SMS', 'Email'
  notes: string;
  timestamp: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  interactions: Interaction[];
}

const ClientProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [interactionType, setInteractionType] = useState('Call');

  const fetchClientData = async () => {
    try {
      const res = await api.get(`/clients/${id}`);
      setClient(res.data);
    } catch (err) {
      console.error("Error fetching client:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/clients/${id}/interactions`, {
        type: interactionType,
        notes: note
      });
      setNote('');
      fetchClientData(); // Refresh timeline
    } catch (err) {
      console.error("Error logging interaction:", err);
    }
  };

  if (loading) return (
    <div className="flex justify-center p-20 text-purple-600">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );

  if (!client) return <div className="p-10 text-center">Client not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Client Header Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
            <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 uppercase mt-1">
              {client.type}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 w-full md:w-auto">
          <div className="flex items-center gap-2"><Mail size={16} /> {client.email}</div>
          <div className="flex items-center gap-2"><Phone size={16} /> {client.phone}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Interaction Logger */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-purple-600" /> Log Interaction
            </h3>
            <form onSubmit={handleLogInteraction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Type</label>
                <select 
                  value={interactionType}
                  onChange={(e) => setInteractionType(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option>Call</option>
                  <option>SMS</option>
                  <option>Email</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Notes</label>
                <textarea 
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Details of the conversation..."
                  className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                />
              </div>
              <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors">
                Save Interaction
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock size={18} className="text-purple-600" /> Activity History
            </h3>
            
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {client.interactions.map((item) => (
                <div key={item.id} className="relative flex items-start gap-6 group">
                  <div className={`mt-1 flex items-center justify-center h-10 w-10 rounded-full border-4 border-white shadow-sm z-10 ${
                    item.type === 'Call' ? 'bg-blue-500 text-white' : 
                    item.type === 'SMS' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    {item.type === 'Call' && <PhoneCall size={16} />}
                    {item.type === 'SMS' && <MessageSquare size={16} />}
                    {item.type === 'Email' && <MailIcon size={16} />}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 group-hover:border-purple-200 transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-gray-800 text-sm">{item.type} with client</span>
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{item.notes}"</p>
                  </div>
                </div>
              ))}
              {client.interactions.length === 0 && (
                <p className="text-center text-gray-400 py-10">No interactions recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;