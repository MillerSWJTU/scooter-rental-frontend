import React, { useState } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Alert } from 'react-bootstrap';
import FeedbackForm from './FeedbackForm';
import FeedbackList from './FeedbackList';
import { useAuth } from '../../contexts/AuthContext';

const FeedbackPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [message, setMessage] = useState('');

  if (!currentUser) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Please log in to view feedback</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col lg={10} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Header as="h4" className="bg-primary text-white">
              Feedback Center
            </Card.Header>
            <Card.Body>
              {message && (
                <Alert variant="success" onClose={() => setMessage('')} dismissible>
                  {message}
                </Alert>
              )}
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="list" title="My Feedback">
                  <FeedbackList />
                </Tab>
                <Tab eventKey="new" title="Submit Feedback">
                  <FeedbackForm onSuccess={() => {
                    setMessage('Feedback submitted successfully!');
                    setActiveTab('list');
                  }} />
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FeedbackPage; 