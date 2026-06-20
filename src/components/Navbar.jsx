import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaMotorcycle, 
  FaSignOutAlt, 
  FaHistory, 
  FaTachometerAlt,
  FaUserCircle,
  FaCommentAlt
} from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <BootstrapNavbar bg="white" expand="lg" className="shadow-sm">
      <Container fluid={isAdmin}>
        <BootstrapNavbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <FaMotorcycle className="me-2" />
          E-Scooter
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="navbar-nav" />
        <BootstrapNavbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {isAdmin ? (
              // Admin navigation links
              <>
                <Nav.Link as={Link} to="/admin/dashboard">
                  <FaTachometerAlt className="me-1" />
                  Admin Dashboard
                </Nav.Link>
                <Nav.Link as={Link} to="/scooters">View Frontend</Nav.Link>
              </>
            ) : (
              // Regular user navigation links
              <>
                <Nav.Link as={Link} to="/">Home</Nav.Link>
                {isAuthenticated && (
                  <>
                    <Nav.Link as={Link} to="/scooters">Rent Scooter</Nav.Link>
                    <Nav.Link as={Link} to="/rentals/manage">Rental Management</Nav.Link>
                    <Nav.Link as={Link} to="/rentals">
                      <FaHistory className="me-1" />
                      Rental History
                    </Nav.Link>
                    <Nav.Link as={Link} to="/feedback">
                      <FaCommentAlt className="me-1" />
                      Feedback Center
                    </Nav.Link>
                  </>
                )}
                <Nav.Link as={Link} to="/about">About Us</Nav.Link>
              </>
            )}
          </Nav>

          <Nav>
            {isAuthenticated ? (
              <div className="d-flex align-items-center">
                <Link 
                  to="/profile" 
                  className="me-3 text-decoration-none d-flex align-items-center"
                >
                  <FaUserCircle className="me-1" />
                  {currentUser?.username}
                  {isAdmin && (
                    <Badge bg="danger" className="ms-2">Admin</Badge>
                  )}
                </Link>
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout}
                  className="d-flex align-items-center"
                >
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 