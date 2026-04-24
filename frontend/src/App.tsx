// this file is the main entry point of our React app.
// It sets up routing and authentication logic.
// traffic controller for the app
// decides which pages exist
// and ensures that agents and admin an only see the pages they are authorized to access

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Layout from './components/Layout';
// Import the real Dashboard page instead of using the local placeholder
import Dashboard from './pages/Dashboard'; 
import Leads from './pages/Leads';
import Properties from './pages/Properties';
import Tasks from './pages/Tasks';
import Deals from './pages/Deals'; // 1. IMPORT THE DEALS PAGE
// Import Settings page (assuming you have one created or are ready to link it)
import Settings from './pages/Settings';
import Register  from './pages/Register';

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

        <Route path="/register" element={<Register />} />

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

        <Route 
          path="/tasks" 
          element={
            token ? (
              <Layout>
                <Tasks />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* 2. ADD PROTECTED DEALS ROUTE (KANBAN) */}
        <Route 
          path="/deals" 
          element={
            token ? (
              <Layout>
                <Deals />
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* Protected Settings Route */}
        <Route 
          path="/settings" 
          element={
            token ? (
              <Layout>
                <Settings />
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