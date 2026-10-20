import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CityProvider } from './context/CityContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CitySelectorModal from './components/CitySelectorModal';

// Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import VenueDetailPage from './pages/VenueDetailPage';
import NearMePage from './pages/NearMePage';
import SmartFinderPage from './pages/SmartFinderPage';
import GroupFinderPage from './pages/GroupFinderPage';
import DataStructuresPage from './pages/DataStructuresPage';
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterCustomerPage from './pages/RegisterCustomerPage';
import RegisterOwnerPage from './pages/RegisterOwnerPage';
import ProfilePage from './pages/ProfilePage';

// Protected Route wrappers
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-gray-500">
        Authenticating session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CityProvider>
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900 selection:bg-brand-500 selection:text-white">
          <Navbar />
          <CitySelectorModal />

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/venue/:id" element={<VenueDetailPage />} />
              <Route path="/near-me" element={<NearMePage />} />
              <Route path="/smart-finder" element={<SmartFinderPage />} />
              <Route path="/group-finder" element={<GroupFinderPage />} />
              <Route path="/data-structures" element={<DataStructuresPage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register-customer" element={<RegisterCustomerPage />} />
              <Route path="/register-owner" element={<RegisterOwnerPage />} />

              {/* Protected Dashboards */}
              <Route
                path="/dashboard/customer"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'admin']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/owner"
                element={
                  <ProtectedRoute allowedRoles={['owner', 'admin']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </CityProvider>
    </AuthProvider>
  );
}
