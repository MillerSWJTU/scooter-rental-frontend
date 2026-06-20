import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaLeaf, FaShieldAlt, FaClock, FaHandshake } from 'react-icons/fa';

const About = () => {
  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col className="text-center">
          <h1 className="display-4 mb-4">About Us</h1>
          <p className="lead text-muted">
            E-Scooter is committed to providing green and convenient short-distance travel solutions for cities.
          </p>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaLeaf className="text-primary mb-3" size={40} />
              <Card.Title>Eco-friendly Travel</Card.Title>
              <Card.Text>
                Use electric scooters to reduce carbon emissions and contribute to environmental protection.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaShieldAlt className="text-primary mb-3" size={40} />
              <Card.Title>Safety Guarantee</Card.Title>
              <Card.Text>
                Regular maintenance and safety checks ensure every ride is safe and reliable.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaClock className="text-primary mb-3" size={40} />
              <Card.Title>Flexible Rental</Card.Title>
              <Card.Text>
                Support hourly and daily rentals to meet different duration needs.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaHandshake className="text-primary mb-3" size={40} />
              <Card.Title>Quality Service</Card.Title>
              <Card.Text>
                Professional customer service team to provide all-day rental support services.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About; 