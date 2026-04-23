/**
 * EXECUTIVE ANALYTICS DASHBOARD
 * Connects to: GET /api/dashboard/stats
 * Features:
 * - Real-time Revenue & Conversion metrics from getAdminStats controller.
 * - Sales Growth chart using commission data over time.
 * - Integration with Role-Based Access Control (Admins/Managers).
 */

import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Users, Home, DollarSign, Loader2, Award } from 'lucide-react';
import api from '../utils/api';

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/stats'); // Updated to match your route
      setData(res.data);
    } catch (err) {
      console.error("Error fetching dashboard analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-purple-600">
      <Loader2 className="animate-spin mb-2" size={32} />
      <p className="text-gray-500 font-medium">Generating financial report...</p>
    </div>
  );

  // We extract the summary and salesData objects from the data returned by your controller
  const { summary, salesData } = data || {};

  // Formats the raw salesData from your controller for the Recharts library
  // This maps your commissionAmount and createdAt fields to the chart
  const chartData = salesData?.map((item: any) => ({
    date: new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: item.commissionAmount
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Analytics</h1>
          <p className="text-gray-500">Financial performance and lead conversion tracking.</p>
        </div>
        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold">
          <Award size={18} />
          {/* Mapping the conversionRate string from your controller */}
          Conversion: {summary?.conversionRate || '0%'}
        </div>
      </div>

      {/* KPI Cards mapping to your controller logic */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              {/* Mapping totalRevenue from the _sum in your controller */}
              <h2 className="text-2xl font-bold">${(summary?.totalRevenue || 0).toLocaleString()}</h2>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Leads</p>
              {/* Mapping totalLeads count from your controller */}
              <h2 className="text-2xl font-bold">{summary?.totalLeads || 0}</h2>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Home size={24}/></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Available Inventory</p>
              {/* Mapping activeProperties from your controller */}
              <h2 className="text-2xl font-bold">{summary?.activeProperties || 0}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Data Chart */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Commission Growth</h3>
            <p className="text-sm text-gray-500">Timeline of closed deal revenue</p>
          </div>
          <TrendingUp className="text-green-500" />
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#94a3b8'}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 12, fill: '#94a3b8'}} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;