import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSignOutAlt } from 'react-icons/fa';

function Navbar({ setAuth }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      setAuth(false);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Error logging out');
    }
  };

  return (
    <nav className="dashboard-nav">
      <div className="nav-right">
        <button 
          className="nav-button logout-button"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar; 