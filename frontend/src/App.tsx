import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Users from './pages/Users';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
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
      </Routes>
    </>
  );
}

export default App;
