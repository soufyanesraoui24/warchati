import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Products from './pages/Products';
import BotSettings from './pages/BotSettings';
import Analytics from './pages/Analytics';
import Channels from './pages/Channels';
import CustomerSimulator from './pages/CustomerSimulator';
import QATemplates from './pages/QATemplates';
import Users from './pages/Users';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="flex h-screen items-center justify-center">جار التحميل...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function AppContent() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/products" element={<Products />} />
                <Route path="/bot-settings" element={<BotSettings />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/channels" element={<Channels />} />
                <Route path="/simulator" element={<CustomerSimulator />} />
                <Route path="/templates" element={<QATemplates />} />
                <Route path="/users" element={<Users />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <SocketProvider>
            <LanguageProvider>
              <ThemeProvider>
                <AppContent />
              </ThemeProvider>
            </LanguageProvider>
          </SocketProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
