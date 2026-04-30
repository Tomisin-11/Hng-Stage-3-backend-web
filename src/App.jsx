// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CallbackPage from './pages/CallbackPage.jsx';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilesPage from './pages/ProfilesPage.jsx';
import ProfileDetailPage from './pages/ProfileDetailPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

// ProtectedRoute — redirects to /login if not authenticated
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', gap: '12px', color: 'var(--text-secondary)',
      }}>
        <div className="spinner" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          Restoring session...
        </span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin()) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route path="/auth/github/callback" element={<CallbackPage />} />

      <Route path="/" element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        {/* TRD Required Pages */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profiles" element={<ProfilesPage />} />
        <Route path="profiles/:id" element={<ProfileDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="users" element={
          <ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
