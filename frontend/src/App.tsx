import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Users from './pages/Users';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'sonner';
import NotificationManager from './components/NotificationManager';

import Tickets from './pages/Tickets';
import TicketDetails from './pages/TicketDetails';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <>
      <Toaster position="top-right" theme="light" richColors toastOptions={{
        className: 'shadow-2xl border border-black/5 bg-white/80 backdrop-blur-2xl text-zinc-800'
      }} />
      <NotificationManager />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/users" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tickets" 
          element={
            <ProtectedRoute>
              <Tickets />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tickets/:id" 
          element={
            <ProtectedRoute>
              <TicketDetails />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;
