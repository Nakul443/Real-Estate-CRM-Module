// dashboard cards
// gives total leads, properties, and users

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

const StatCard = ({ title, value, icon: Icon, trend, trendUp }: StatCardProps) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
          
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
              {trendUp ? '↑' : '↓'} {trend} <span className="text-gray-400 font-normal ml-1">vs last month</span>
            </p>
          )}
        </div>
        
        <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
          <Icon className="text-purple-600" size={24} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;