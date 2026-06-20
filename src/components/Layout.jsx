import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container } from 'react-bootstrap';
import Navbar from './Navbar';
import AdminSidebar from './admin/AdminSidebar';

const Layout = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <Container className="py-4">
          {children}
        </Container>
      </>
    );
  }

  if (isAdmin) {
    return (
      <div className="d-flex">
        <AdminSidebar />
        <div className="flex-grow-1">
          <Navbar />
          <Container fluid className="py-4 px-4">
            {children}
          </Container>
        </div>
      </div>
    );
  }

  // Regular user view
  return (
    <>
      <Navbar />
      <Container className="py-4">
        {children}
      </Container>
    </>
  );
};

export default Layout; 