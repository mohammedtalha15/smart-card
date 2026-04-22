import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import StudentDashboard from './pages/StudentDashboard';
import VendorDetail from './pages/VendorDetail';
import QRPage from './pages/QRPage';
import TransactionHistory from './pages/TransactionHistory';
import VendorPortal from './pages/VendorPortal';
import VendorScan from './pages/VendorScan';
import AdminDashboard from './pages/AdminDashboard';
import AdminVendors from './pages/AdminVendors';
import AdminOffers from './pages/AdminOffers';
import AdminTransactions from './pages/AdminTransactions';
import AdminDomains from './pages/AdminDomains';

function AppRouter() {
  const location = useLocation();
  // Check URL fragment for session_id synchronously during render
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/vendor/:id" element={<ProtectedRoute roles={['student']}><VendorDetail /></ProtectedRoute>} />
      <Route path="/qr" element={<ProtectedRoute roles={['student']}><QRPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute roles={['student']}><TransactionHistory /></ProtectedRoute>} />
      <Route path="/vendor-portal" element={<ProtectedRoute roles={['vendor']}><VendorPortal /></ProtectedRoute>} />
      <Route path="/vendor-portal/scan" element={<ProtectedRoute roles={['vendor']}><VendorScan /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/vendors" element={<ProtectedRoute roles={['admin']}><AdminVendors /></ProtectedRoute>} />
      <Route path="/admin/offers" element={<ProtectedRoute roles={['admin']}><AdminOffers /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute roles={['admin']}><AdminTransactions /></ProtectedRoute>} />
      <Route path="/admin/domains" element={<ProtectedRoute roles={['admin']}><AdminDomains /></ProtectedRoute>} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'vendor') return <Navigate to="/vendor-portal" replace />;
  return <Navigate to="/dashboard" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'vendor') return <Navigate to="/vendor-portal" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" data-testid="loading-screen">
      <div className="animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center">
          <span className="text-white font-bold text-2xl font-heading">A</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
