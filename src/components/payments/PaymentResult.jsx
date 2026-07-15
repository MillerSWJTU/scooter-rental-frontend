import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import paymentService from '../../services/payment.service';

const PaymentResult = () => {
  const { paymentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  
  // 从URL参数中获取状态
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.get('status');
  const transactionId = searchParams.get('transactionId');
  const rentalId = searchParams.get('rentalId');
  
  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 如果有支付ID，使用ID查询
        if (paymentId) {
          const paymentData = await paymentService.getPaymentById(paymentId);
          setPayment(paymentData);
          
          // 如果支付成功，更新支付状态
          if (paymentData.status === 'COMPLETED') {
            // 支付成功
          }
        } 
        // 如果有交易ID和状态，处理回调
        else if (transactionId && status) {
          // 处理支付回调
          const result = paymentService.processPaymentCallback(transactionId, status);
          // 在真实场景中，这里应该等待服务器响应，然后更新UI
          setPayment({
            id: 0,
            transactionId,
            status,
            amount: 0,
            rentalId: rentalId ? Number(rentalId) : null,
            createdAt: new Date().toISOString()
          });
          
          // 如果支付成功且有租赁ID，更新支付状态
          if (status === 'COMPLETED') {
            // 支付成功
          }
        } else {
          setError('无效的支付查询');
        }
      } catch (err) {
        console.error('获取支付信息失败:', err);
        setError('获取支付信息失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentDetails();
  }, [paymentId, transactionId, status, rentalId]);
  
  const handleBackToRentals = () => {
    navigate('/rentals');
  };
  
  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p>加载中...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="secondary" onClick={handleBackToRentals}>
          返回租赁历史
        </Button>
      </Container>
    );
  }
  
  const isSuccess = payment?.status === 'COMPLETED' || status === 'COMPLETED';
  
  return (
    <Container className="mt-4">
      <Row>
        <Col md={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Header as="h5" className={isSuccess ? 'bg-success text-white' : 'bg-danger text-white'}>
              支付结果
            </Card.Header>
            <Card.Body className="text-center py-5">
              <div className="mb-4">
                {isSuccess ? (
                  <FontAwesomeIcon icon={faCheckCircle} size="6x" className="text-success mb-3" />
                ) : (
                  <FontAwesomeIcon icon={faTimesCircle} size="6x" className="text-danger mb-3" />
                )}
                
                <h2>{isSuccess ? '支付成功' : '支付失败'}</h2>
                
                {payment && (
                  <div className="mt-3">
                    {payment.transactionId && (
                      <p><strong>交易号:</strong> {payment.transactionId}</p>
                    )}
                    {payment.amount && (
                      <p><strong>金额:</strong> ¥{payment.amount.toFixed(2)}</p>
                    )}
                    {payment.createdAt && (
                      <p><strong>时间:</strong> {new Date(payment.createdAt).toLocaleString()}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleBackToRentals}
                >
                  返回租赁历史
                </Button>
              </div>
            </Card.Body>
            <Card.Footer className="text-muted">
              <small>如有问题请联系客服: 400-123-4567</small>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentResult; 