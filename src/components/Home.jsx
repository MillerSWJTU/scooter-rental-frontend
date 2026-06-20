import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaMotorcycle } from 'react-icons/fa';

const Home = () => {
  return (
    <Container className="py-5">
      <Row className="align-items-center">
        <Col md={6} className="text-center text-md-start">
          <h1 className="display-4 mb-4">Welcome to E-Scooter</h1>
          <p className="lead mb-4">
            Convenient and eco-friendly urban mobility. Rent anytime, anywhere.
          </p>
          <Button 
            as={Link} 
            to="/scooters" 
            variant="primary" 
            size="lg"
            className="mb-3"
          >
            <FaMotorcycle className="me-2" />
            Rent Now
          </Button>
        </Col>
        <Col md={6} className="text-center">
          <img 
            src="/images/scooter.jpg" 
            alt="E-Scooter" 
            className="img-fluid rounded shadow"
            style={{ maxHeight: '400px' }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Home; 