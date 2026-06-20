import React from 'react';
import { Container, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import PersonalCard from './PersonalCard';

const Profile = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Please log in first</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <PersonalCard />
    </Container>
  );
};

export default Profile; 