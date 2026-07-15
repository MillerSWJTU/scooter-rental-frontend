import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Alert,
  Spinner,
  Button,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import { 
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaMotorcycle,
  FaMapMarkedAlt,
  FaCreditCard,
  FaCheckCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useRental } from '../../contexts/RentalContext';
import { useAuth } from '../../contexts/AuthContext';
import rentalService from '../../services/rental.service';
import '../../styles/components/RentalHistory.css';

const RentalHistory = () => {
  const { rentals, loading, error, loadUserRentals } = useRental();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [paidRentals, setPaidRentals] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadUserRentals();
      // 从localStorage加载已支付的租赁ID
      const savedPaidRentals = localStorage.getItem('paidRentals');
      if (savedPaidRentals) {
        try {
          setPaidRentals(JSON.parse(savedPaidRentals));
        } catch (e) {
          console.error('解析已支付租赁记录失败:', e);
          setPaidRentals([]);
        }
      }
    }
  }, [currentUser, loadUserRentals]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge bg="success">Finished</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">Unknown status</Badge>;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Unknown time';
    return new Date(dateString).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (startTime, endTime, rental) => {
    if (!startTime) return 'Unknown time';
    
    if (rental?.duration && rental?.plan) {
      switch (rental.plan) {
        case 'DAILY':
          return `${rental.duration} day(s)`;
        case 'WEEKLY':
          return `${rental.duration} week(s)`;
        case 'FOUR_HOURS':
          return `${rental.duration * 4} hour(s)`;
        case 'HOURLY':
        default:
          break;
      }
    }
    
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffInMinutes = Math.floor((end - start) / (1000 * 60));
    
    if (diffInMinutes >= 24 * 60) {
      const days = Math.floor(diffInMinutes / (24 * 60));
      const hours = Math.floor((diffInMinutes % (24 * 60)) / 60);
      return hours > 0 ? `${days} day(s) ${hours} hour(s)` : `${days} day(s)`;
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute(s)`;
    } else {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return minutes > 0 ? `${hours} hour(s) ${minutes} min` : `${hours} hour(s)`;
    }
  };

  const formatCost = (cost) => {
    if (cost === undefined || cost === null) return '0.00';
    return Number(cost).toFixed(2);
  };

  const handlePayment = async (rentalId) => {
    try {
      // 获取租赁详情
      const rental = rentals.find(r => r.id === rentalId);
      if (!rental) {
        throw new Error('未找到租赁记录');
      }

      // 检查是否已支付
      const paidRentals = JSON.parse(localStorage.getItem('paidRentals') || '[]');
      if (paidRentals.includes(rentalId)) {
        throw new Error('该租赁已支付，无需重复支付');
      }

      // 跳转到支付页面
      navigate(`/rentals/${rentalId}/payment`);
    } catch (error) {
      console.error('支付处理失败:', error);
      alert(error.message || '支付处理失败，请稍后重试');
    }
  };

  // 检查租赁是否已支付
  const isRentalPaid = (rental) => {
    // 如果租赁状态是已取消，则不需要支付
    if (rental.status?.toLowerCase() === 'cancelled') {
      return true;
    }
    
    // 检查后端返回的支付状态
    if (rental.paymentStatus?.toLowerCase() === 'paid') {
      return true;
    }
    
    // 检查本地存储的支付状态
    const paidRentals = JSON.parse(localStorage.getItem('paidRentals') || '[]');
    return paidRentals.includes(rental.id);
  };

  // 获取支付状态徽章
  const getPaymentStatusBadge = (rental) => {
    if (rental.status?.toLowerCase() === 'cancelled') {
      return null; // Cancelled rentals do not show payment status
    }
    return isRentalPaid(rental) ? 
      <Badge bg="success" className="ms-2">Paid</Badge> : 
      <Badge bg="warning" text="dark" className="ms-2">Unpaid</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading rental records...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Failed to load</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={loadUserRentals}>
              Retry
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const completedRentals = rentals.filter(rental => 
    rental.status?.toLowerCase() === 'completed' || 
    rental.status?.toLowerCase() === 'cancelled'
  );

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Rental History</h2>
        <Button variant="outline-primary" onClick={loadUserRentals}>
          Refresh
        </Button>
      </div>
      
      {completedRentals.length === 0 ? (
        <Alert variant="info">
          You have no rental history yet.
        </Alert>
      ) : (
        <Row>
          {completedRentals.map((rental) => (
            <Col md={6} lg={4} key={rental.id} className="mb-4">
              <Card className="h-100 shadow-sm rental-history-card">
                <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                  <div className="d-flex align-items-center">
                    <FaMotorcycle className="me-2" />
                    <span>{rental.scooter?.model || 'E-Scooter'}</span>
                  </div>
                  <div>
                    {getStatusBadge(rental.status)}
                    {getPaymentStatusBadge(rental)}
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="rental-details">
                    <div className="mb-3">
                      <div className="mb-2">
                        <FaMapMarkerAlt className="me-2 text-primary" />
                        <strong>Start Location: </strong>
                        <span>{rental.startLocation || 'Unknown location'}</span>
                      </div>
                      <div className="mb-2">
                        <FaMapMarkedAlt className="me-2 text-success" />
                        <strong>End Location: </strong>
                        <span>{rental.endLocation || 'Unknown location'}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="mb-2">
                        <FaClock className="me-2 text-info" />
                        <strong>Start Time: </strong>
                        <span>{formatTime(rental.startTime)}</span>
                      </div>
                      <div className="mb-2">
                        <FaClock className="me-2 text-warning" />
                        <strong>End Time: </strong>
                        <span>{formatTime(rental.endTime)}</span>
                      </div>
                      <div className="mb-2">
                        <FaClock className="me-2 text-secondary" />
                        <strong>Duration: </strong>
                        <span>
                          {formatDuration(rental.startTime, rental.endTime, rental)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 d-flex justify-content-between align-items-center border-top pt-2">
                      <div className="d-flex align-items-center">
                        <FaMoneyBillWave className="me-2 text-success" />
                        <strong>Total Cost: </strong>
                      </div>
                      <h5 className="mb-0 text-success">
                        ¥{formatCost(rental.totalCost)}
                      </h5>
                    </div>
                    
                    {rental.status?.toLowerCase() === 'completed' && !isRentalPaid(rental) && (
                      <div className="mt-3 d-flex justify-content-end">
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handlePayment(rental.id)}
                        >
                          <FaCreditCard className="me-1" />
                          Pay
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default RentalHistory; 