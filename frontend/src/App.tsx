// this file is the main entry point of our React app.
// It sets up routing and authentication logic.
// traffic controller for the app
// decides which pages exist
// and ensures that agents and admin an only see the pages they are authorized to access

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Layout from './components/Layout';
import StatCard from './components/StatCard';
import Leads from './pages/Leads';
import Properties from './pages/Properties';
import { Users, Building2, TrendingUp, Clock } from 'lucide-react';

// Dashboard component: The home screen showing high-level stats
const Dashboard = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      <p className="text-gray-500">Track your real estate performance and lead pipeline.</p>
    </div>

    {/* Stat Cards Grid: Summary of CRM data */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Leads" 
        value="128" 
        icon={Users} 
        trend="12%" 
        trendUp={true} 
      />
      <StatCard 
        title="Active Listings" 
        value="43" 
        icon={Building2} 
      />
      <StatCard 
        title="Closed Deals" 
        value="12" 
        icon={TrendingUp} 
        trend="4%" 
        trendUp={true} 
      />
      <StatCard 
        title="Pending Tasks" 
        value="8" 
        icon={Clock} 
        trend="2" 
        trendUp={false} 
      />
    </div>

    {/* Placeholder for future activity logs */}
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="h-32 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-gray-400">
        Activity feed integration coming next...
      </div>
    </div>
  </div>
);

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Route: If the user isn't logged in, show Login. Otherwise, send to Dashboard */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />

        {/* Protected Dashboard Route */}
        <Route 
          path="/" 
          element={
            token ? (
              <Layout>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Protected Leads Route: Shows the lead management table */}
        <Route 
          path="/leads" 
          element={
            token ? (
              <Layout>
                <Leads />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route 
          path="/properties" 
          element={
            token ? (
              <Layout>
                <Properties />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Fallback: Any unknown URL redirects to the home page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;