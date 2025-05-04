import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSignOutAlt, FaCode } from 'react-icons/fa';

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
    <nav className="navbar">
      <div className="navbar-brand">
        <FaCode />
        <span>Code Snippets</span>
      </div>
      <div className="navbar-menu">
        {/* <a href="/dashboard" className="navbar-item">Dashboard</a>
        <a href="/new-snippet" className="navbar-item">New Snippet</a> */}
      </div>
      <div className="navbar-end">
        <button 
          className="logout-btn"
          onClick={handleLogout}
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar; 