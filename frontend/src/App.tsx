import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Layout from './components/Layout'; // Import our new Layout

// Placeholder components
const Dashboard = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold">Dashboard Overview</h1>
    <p className="text-gray-600">Welcome to your Real Estate CRM. Analytics coming soon.</p>
  </div>
);

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Route: If logged in, redirect away from login to dashboard */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />

        {/* Protected Route: Wrapped in our Layout */}
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

        {/* Fallback to Dashboard/Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;