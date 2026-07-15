import React, { useState, useEffect } from 'react';
import { Table, Container, Spinner, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import feedbackService from '../../services/feedback.service';

const FeedbackList = () => {
  const { currentUser } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        const feedbackData = await feedbackService.getUserFeedbacks(currentUser.username);
        setFeedbacks(feedbackData);
      } catch (err) {
        console.error('Failed to fetch feedback list:', err);
        setError('Failed to fetch feedback list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchFeedbacks();
    }
  }, [currentUser]);

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      PROCESSING: 'info',
      RESOLVED: 'success',
      CLOSED: 'secondary'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    const variants = {
      PAYMENT_ISSUE: 'danger',
      SERVICE_QUALITY: 'primary',
      TECHNICAL_ISSUE: 'warning',
      SUGGESTION: 'info',
      COMPLAINT: 'danger',
      OTHER: 'secondary'
    };
    return <Badge bg={variants[type]}>{type}</Badge>;
  };

  if (loading) {
    return (
      <Container className="text-center mt-4">
        <Spinner animation="border" />
        <p>Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Type</th>
          <th>Content</th>
          <th>Rating</th>
          <th>Status</th>
          <th>Submit Time</th>
          <th>Process Time</th>
          <th>Admin Response</th>
        </tr>
      </thead>
      <tbody>
        {feedbacks.map((feedback) => (
          <tr key={feedback.id}>
            <td>{getTypeBadge(feedback.type)}</td>
            <td>{feedback.content}</td>
            <td>{feedback.rating ? '⭐'.repeat(feedback.rating) : '-'}</td>
            <td>{getStatusBadge(feedback.status)}</td>
            <td>{new Date(feedback.createdAt).toLocaleString()}</td>
            <td>{feedback.resolvedAt ? new Date(feedback.resolvedAt).toLocaleString() : '-'}</td>
            <td>{feedback.adminResponse || '-'}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default FeedbackList; 