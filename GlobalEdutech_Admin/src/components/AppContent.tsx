import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import LoginPage from '../pages/LoginPage';
import logo from '../assets/logo.png';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [booting, setBooting] = useState<boolean>(true);
  useEffect(() => {
    const id = setTimeout(() => setBooting(false), 400);
    return () => clearTimeout(id);
  }, []);
  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <img src={logo} alt="Loading" className="w-24 h-24 animate-pulse" />
      </div>
    );
  }
  return isAuthenticated ? <DashboardLayout /> : <LoginPage />;
};

export default AppContent;