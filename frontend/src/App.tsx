import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// These are "Shell" components we will build next
const Login = () => <div className="p-10 text-center">Login Page (Coming Next)</div>;
const Dashboard = () => <div className="p-10 text-center">Dashboard (Phase 3)</div>;

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />

        {/* Protected Routes (Only for logged-in users) */}
        <Route 
          path="/" 
          element={token ? <Dashboard /> : <Navigate to="/login" />} 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;