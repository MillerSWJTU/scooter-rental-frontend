import React, { useState } from 'react';
import { Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import feedbackService from '../../services/feedback.service';

const FeedbackForm = ({ onSuccess }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    type: 'OTHER',
    content: '',
    rating: 0,
    contactInfo: '',
    paymentId: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await feedbackService.createFeedback({
        ...formData,
        username: currentUser.username
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError('Failed to submit feedback. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form.Group className="mb-3">
        <Form.Label>Feedback Type</Form.Label>
        <Form.Select
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="PAYMENT_ISSUE">Payment Issue</option>
          <option value="SERVICE_QUALITY">Service Quality</option>
          <option value="TECHNICAL_ISSUE">Technical Issue</option>
          <option value="SUGGESTION">Suggestion</option>
          <option value="COMPLAINT">Complaint</option>
          <option value="OTHER">Other</option>
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Feedback Content</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Please describe your issue or suggestion in detail"
          required
        />
      </Form.Group>

      <Row className="mb-3">
        <Col>
          <Form.Group>
            <Form.Label>Rating</Form.Label>
            <div>
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant={formData.rating >= star ? 'warning' : 'outline-warning'}
                  className="me-2"
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  type="button"
                >
                  ⭐
                </Button>
              ))}
            </div>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group>
            <Form.Label>Contact Information</Form.Label>
            <Form.Control
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleChange}
              placeholder="Please enter your contact information (optional)"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Order Reference</Form.Label>
        <Form.Control
          type="text"
          name="paymentId"
          value={formData.paymentId}
          onChange={handleChange}
          placeholder="Please enter related order number (optional)"
        />
      </Form.Group>

      <Button
        variant="primary"
        type="submit"
        disabled={submitting}
        className="w-100"
      >
        {submitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </Form>
  );
};

export default FeedbackForm;