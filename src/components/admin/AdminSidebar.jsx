import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaBiking, 
  FaCommentAlt
} from 'react-icons/fa';
import '../../styles/components/AdminSidebar.css';

const AdminSidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-sidebar bg-dark text-white p-3">
      <div className="sidebar-header mb-4">
        <h4 className="text-center">Admin Console</h4>
      </div>
      <Nav className="flex-column">
        <Nav.Link 
          as={Link} 
          to="/admin/dashboard" 
          className={`sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
        >
          <FaTachometerAlt className="me-2" />
          Dashboard
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/admin/users" 
          className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`}
        >
          <FaUsers className="me-2" />
          User Management
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/admin/scooters" 
          className={`sidebar-link ${isActive('/admin/scooters') ? 'active' : ''}`}
        >
          <FaBiking className="me-2" />
          Scooter Management
        </Nav.Link>
        <Nav.Link 
          as={Link} 
          to="/admin/feedbacks" 
          className={`sidebar-link ${isActive('/admin/feedbacks') ? 'active' : ''}`}
        >
          <FaCommentAlt className="me-2" />
          Feedback Management
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default AdminSidebar; 