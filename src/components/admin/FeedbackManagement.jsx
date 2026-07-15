import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Table, 
  Badge, 
  Button, 
  Modal, 
  Form, 
  Alert,
  Row,
  Col,
  Card
} from 'react-bootstrap';
import feedbackService from '../../services/feedback.service';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await feedbackService.getAllFeedbacks();
      setFeedbacks(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch feedback list');
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (feedback) => {
    setSelectedFeedback(feedback);
    setReplyContent('');
    setShowReplyModal(true);
  };

  const handleSubmitReply = async () => {
    try {
      await feedbackService.updateFeedback(selectedFeedback.id, {
        adminResponse: replyContent,
        status: 'RESOLVED'
      });
      setShowReplyModal(false);
      fetchFeedbacks();
    } catch (err) {
      setError('Failed to submit reply');
      console.error('Error submitting reply:', err);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      IN_PROGRESS: 'info',
      RESOLVED: 'success'
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const statusMatch = filterStatus === 'ALL' || feedback.status === filterStatus;
    const typeMatch = filterType === 'ALL' || feedback.type === filterType;
    return statusMatch && typeMatch;
  });

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">User Feedback Management</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status Filter</Form.Label>
                <Form.Select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Type Filter</Form.Label>
                <Form.Select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="ALL">All Type</option>
                  <option value="PAYMENT_ISSUE">Payment Issue</option>
                  <option value="SERVICE_QUALITY">Service Quality</option>
                  <option value="TECHNICAL_ISSUE">Technical Issue</option>
                  <option value="SUGGESTION">Suggestion</option>
                  <option value="COMPLAINT">Complaint</option>
                  <option value="OTHER">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Type</th>
            <th>Content</th>
            <th>Rating</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" className="text-center">Loading...</td>
            </tr>
          ) : filteredFeedbacks.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">No feedback found</td>
            </tr>
          ) : (
            filteredFeedbacks.map(feedback => (
              <tr key={feedback.id}>
                <td>{feedback.id}</td>
                <td>{feedback.username || 'Unknown User'}</td>
                <td>{getTypeBadge(feedback.type)}</td>
                <td>{feedback.content}</td>
                <td>{feedback.rating ? `${feedback.rating} Star` : 'Unrated'}</td>
                <td>{getStatusBadge(feedback.status)}</td>
                <td>{formatDate(feedback.createdAt)}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleReply(feedback)}
                    disabled={feedback.status === 'RESOLVED'}
                  >
                    Reply
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reply to Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Feedback Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={selectedFeedback?.content}
                readOnly
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Reply Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Enter reply content..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitReply}>
            Submit Reply
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FeedbackManagement; 