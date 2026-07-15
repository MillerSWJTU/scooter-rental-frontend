import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import paymentService from '../../services/payment.service';
import rentalService from '../../services/rental.service';

const PaymentForm = () => {
  const { rentalId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('WECHAT');
  const [submitting, setSubmitting] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  
  useEffect(() => {
    const fetchRental = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!rentalId) {
          setError('Rental ID is invalid');
          setLoading(false);
          return;
        }
        
        const rentalData = await rentalService.getRentalById(rentalId);
        setRental(rentalData);
      } catch (err) {
        console.error('Failed to get rental information:', err);
        setError('Failed to get rental information, please try again later');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRental();
  }, [rentalId, currentUser]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!rental) {
      setError('Invalid rental record');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // 如果选择钱包支付，通过后端处理
      if (paymentMethod === 'WALLET') {
        const payment = await paymentService.createPaymentForRental(
          rentalId,
          rental.totalCost,
          'WALLET',
          currentUser.email
        );
        setPaymentCreated(true);
        setPaymentData(payment);
        return;
      }
      
      // 创建支付
      const payment = await paymentService.createPaymentForRental(
        rentalId,
        rental.totalCost,
        paymentMethod,
        currentUser.email
      );
      
      setPaymentCreated(true);
      setPaymentData(payment);
      
    } catch (err) {
      console.error('Failed to create payment:', err);
      setError('Failed to create payment, please try again later');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSimulatePayment = async (success) => {
    if (!paymentData || !paymentData.id) {
      setError('Invalid payment information');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // 模拟支付处理
      const updatedPayment = await paymentService.simulatePayment(paymentData.id, success);
      
      if (success) {
        // 支付成功，跳转到租赁管理页面
        navigate('/rentals', { 
          state: { message: 'Payment successful!', type: 'success' } 
        });
      } else {
        // 支付失败，显示错误信息
        setError('Payment failed, please try again');
        setPaymentCreated(false);
        setPaymentData(null);
      }
    } catch (err) {
      console.error('Failed to process payment:', err);
      setError('Failed to process payment, please try again later');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p>Loading...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={() => navigate('/rentals')}>
          Return to rental history
        </Button>
      </Container>
    );
  }
  
  if (!rental) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">No rental record found</Alert>
        <Button variant="secondary" onClick={() => navigate('/rentals')}>
          Return to rental history
        </Button>
      </Container>
    );
  }
  
  return (
    <Container className="mt-4">
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Header as="h5" className="bg-primary text-white">
              Rental Payment
            </Card.Header>
            <Card.Body>
              {!paymentCreated ? (
                <>
                  <Card.Title>Order Information</Card.Title>
                  <div className="mb-4">
                    <p><strong>Rental ID:</strong> {rental.id}</p>
                    <p><strong>Scooter Model:</strong> {rental.scooter?.model || 'Unknown'}</p>
                    <p><strong>Rental Time:</strong> {new Date(rental.startTime).toLocaleString()}</p>
                    <p><strong>End Time:</strong> {rental.endTime ? new Date(rental.endTime).toLocaleString() : 'Not ended'}</p>
                    <p><strong>Rental Plan:</strong> {rental.plan}</p>
                    <p><strong>Payment Amount:</strong> <span className="text-danger font-weight-bold">¥{rental.totalCost?.toFixed(2) || '0.00'}</span></p>
                  </div>
                  
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method</Form.Label>
                      <Form.Select 
                        value={paymentMethod} 
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={submitting}
                      >
                        <option value="WALLET">Wallet Payment</option>
                        <option value="WECHAT">WeChat Payment</option>
                        <option value="ALIPAY">Alipay</option>
                      </Form.Select>
                    </Form.Group>

                    {paymentMethod === 'WECHAT' && (
                      <div className="text-center mt-3">
                        <div className="p-3 bg-light rounded">
                          <h5>WeChat Payment</h5>
                          <p>Please open WeChat and scan the QR code below to complete the payment</p>
                          <div className="d-flex justify-content-center">
                            <div className="border p-2" style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <p className="text-muted">WeChat Payment QR Code</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'ALIPAY' && (
                      <div className="text-center mt-3">
                        <div className="p-3 bg-light rounded">
                          <h5>Alipay Payment</h5>
                          <p>Please open Alipay and scan the QR code below to complete the payment</p>
                          <div className="d-flex justify-content-center">
                            <div className="border p-2" style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <p className="text-muted">Alipay QR Code</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="d-grid gap-2">
                      <Button 
                        variant="success" 
                        type="submit" 
                        size="lg"
                        disabled={submitting}
                      >
                        {submitting ? <Spinner animation="border" size="sm" /> : null}
                        {' '}Confirm Payment
                      </Button>
                    </div>
                  </Form>
                </>
              ) : (
                <>
                  <Card.Title>Confirm Payment</Card.Title>
                  <Alert variant="info">
                    <p>Your payment request has been created, please click the button below to complete the payment.</p>
                    <p>Transaction ID: {paymentData.transactionId}</p>
                  </Alert>
                  
                  <div className="text-center mb-4">
                    <img 
                      src={paymentData.qrCodeUrl || 'https://via.placeholder.com/200x200?text=支付二维码'} 
                      alt="支付二维码"
                      style={{ maxWidth: '200px' }}
                    />
                  </div>
                  
                  <div className="d-flex justify-content-between">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setPaymentCreated(false)}
                      disabled={submitting}
                    >
                      Return
                    </Button>
                    
                    <div>
                      <Button 
                        variant="success" 
                        onClick={() => handleSimulatePayment(true)}
                        disabled={submitting}
                        className="me-2"
                      >
                        {submitting ? <Spinner animation="border" size="sm" /> : null}
                        {' '}Simulate Successful Payment
                      </Button>
                      
                      <Button 
                        variant="danger" 
                        onClick={() => handleSimulatePayment(false)}
                        disabled={submitting}
                      >
                        Simulate Failed Payment
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
            <Card.Footer className="text-muted">
              <small>If you have any questions, please contact customer service: 400-123-4567</small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentForm; 