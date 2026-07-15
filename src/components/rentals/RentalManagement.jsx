import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Badge, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { FaMapMarkerAlt, FaClock, FaMoneyBillWave, FaMotorcycle, FaBatteryThreeQuarters, FaHistory, FaPlus, FaMinus, FaStop, FaBan, FaSync } from 'react-icons/fa';
import { useRental } from '../../contexts/RentalContext';
import { useAuth } from '../../contexts/AuthContext';
import rentalService from '../../services/rental.service';
import '../../styles/components/RentalManagement.css';
import '../../styles/components/RentalHistory.css';

const RentalManagement = () => {
  const { currentUser } = useAuth();
  const { rentals, loading, error, loadUserRentals } = useRental();
  const [currentRental, setCurrentRental] = useState(null);
  const [recentRentals, setRecentRentals] = useState([]);
  
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [extensionHours, setExtensionHours] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      loadUserRentals();
    }
  }, [currentUser, loadUserRentals]);

  useEffect(() => {
    const active = rentals.find(rental => rental.status === 'ACTIVE');
    setCurrentRental(active);

    const recent = rentals
      .filter(rental => rental.status !== 'ACTIVE')
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
      .slice(0, 3);
    setRecentRentals(recent);
  }, [rentals]);

  const handleRentalUpdate = () => {
    loadUserRentals();
  };

  const resetState = () => {
    setActionError('');
    setProcessing(false);
    setRetryCount(0);
  };

  const handleRetry = async (action) => {
    setRetryCount(prev => prev + 1);
    if (retryCount >= 3) {
      setActionError('多次重试失败，请刷新页面后重试');
      return;
    }
    
    switch (action) {
      case 'extend':
        await handleExtend();
        break;
      case 'end':
        await handleEnd();
        break;
      case 'cancel':
        await handleCancel();
        break;
      default:
        break;
    }
  };

  const handleExtend = async () => {
    setProcessing(true);
    setActionError('');
    try {
      if (!currentRental?.id) {
        throw new Error('租赁信息无效');
      }
      if (!extensionHours || extensionHours <= 0) {
        throw new Error('延长时间必须大于0');
      }
      const updatedRental = await rentalService.extendRental(currentRental.id, extensionHours);
      if (updatedRental) {
        setShowExtendModal(false);
        resetState();
        handleRentalUpdate();
      } else {
        throw new Error('未能获取更新后的租赁信息');
      }
    } catch (err) {
      console.error('延长租赁失败:', err);
      setActionError(err.response?.data?.message || err.message || '延长租赁失败，请稍后重试');
      setProcessing(false);
    }
  };

  const handleEnd = async () => {
    setProcessing(true);
    setActionError('');
    try {
      if (!currentRental?.id) {
        throw new Error('租赁信息无效');
      }
      const updatedRental = await rentalService.endRental(currentRental.id);
      if (updatedRental) {
        setShowEndModal(false);
        resetState();
        handleRentalUpdate();
      } else {
        throw new Error('未能获取更新后的租赁信息');
      }
    } catch (err) {
      setActionError(err.message);
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    setProcessing(true);
    setActionError('');
    try {
      if (!currentRental?.id) {
        throw new Error('租赁信息无效');
      }
      const updatedRental = await rentalService.cancelRental(currentRental.id);
      if (updatedRental) {
        setShowCancelModal(false);
        resetState();
        handleRentalUpdate();
      } else {
        throw new Error('未能获取更新后的租赁信息');
      }
    } catch (err) {
      setActionError(err.message);
      setProcessing(false);
    }
  };

  const renderErrorWithRetry = (action) => (
    <Alert variant="danger" className="mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <div>{actionError}</div>
        {retryCount < 3 && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleRetry(action)}
            disabled={processing}
          >
            <FaSync className="me-1" />
            Retry
          </Button>
        )}
      </div>
    </Alert>
  );

  const formatDuration = (startTime, endTime, rental) => {
    if (!startTime) return 'Unknown';
    
    // 如果提供了租赁计划信息，优先使用计划信息
    if (rental?.duration && rental?.plan) {
      switch (rental.plan) {
        case 'DAILY':
          return `${rental.duration} day(s)`;
        case 'WEEKLY':
          return `${rental.duration} week(s)`;
        case 'FOUR_HOURS':
          return `${rental.duration * 4} hours`;
        case 'HOURLY':
        default:
          break;
      }
    }

    // 计算实际使用时长
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(); // 如果没有结束时间，使用当前时间
    const diff = Math.floor((end - start) / (1000 * 60)); // 分钟数
    
    if (diff >= 24 * 60) {
      const days = Math.floor(diff / (24 * 60));
      const hours = Math.floor((diff % (24 * 60)) / 60);
      return hours > 0 ? `${days} day(s) ${hours} hour(s)` : `${days} day(s)`;
    }
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return minutes > 0 ? `${hours} hour(s) ${minutes} min` : `${hours} hour(s)`;
  };

  const getMaxExtensionHours = () => {
    if (!currentRental?.plan) return 24;
    
    switch (currentRental.plan) {
      case 'DAILY':
        return 24; // 按天租赁，最多延长24小时
      case 'WEEKLY':
        return 168; // 按周租赁，最多延长7天（168小时）
      case 'FOUR_HOURS':
        return 4; // 4小时套餐，最多延长4小时
      case 'HOURLY':
      default:
        return 24; // 按小时租赁，最多延长24小时
    }
  };

  const getMinExtensionHours = () => {
    if (!currentRental?.plan) return 1;
    
    switch (currentRental.plan) {
      case 'DAILY':
        return 1; // 按天租赁，最少延长1小时
      case 'WEEKLY':
        return 24; // 按周租赁，最少延长1天（24小时）
      case 'FOUR_HOURS':
        return 1; // 4小时套餐，最少延长1小时
      case 'HOURLY':
      default:
        return 1; // 按小时租赁，最少延长1小时
    }
  };

  const getExtensionStep = () => {
    if (!currentRental?.plan) return 1;
    
    switch (currentRental.plan) {
      case 'DAILY':
        return 1; // 按天租赁，以1小时为步长
      case 'WEEKLY':
        return 24; // 按周租赁，以1天（24小时）为步长
      case 'FOUR_HOURS':
        return 1; // 4小时套餐，以1小时为步长
      case 'HOURLY':
      default:
        return 1; // 按小时租赁，以1小时为步长
    }
  };

  const getPlanDescription = () => {
    if (!currentRental?.plan) return '按小时';
    
    switch (currentRental.plan) {
      case 'DAILY':
        return '按天';
      case 'WEEKLY':
        return '按周';
      case 'FOUR_HOURS':
        return '4小时套餐';
      case 'HOURLY':
      default:
        return '按小时';
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading rental info...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Failed to load</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-end">
            <button className="btn btn-outline-danger" onClick={loadUserRentals}>
              Retry
            </button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Rental Management</h2>

      {currentRental ? (
        <Card className="mb-4 rental-management-card">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Current Rental</h5>
            <Badge bg="warning" text="dark">In Use</Badge>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <FaMotorcycle className="me-2 text-primary" />
                  <strong>Scooter Info</strong>
                  <p className="ms-4 mb-2">
                    Model: {currentRental.scooter?.model || 'Unknown model'}<br />
                    Status: {currentRental.scooter?.status === 'AVAILABLE' ? 'Available' :
                          currentRental.scooter?.status === 'RENTED' ? 'Rented' :
                          currentRental.scooter?.status === 'MAINTENANCE' ? 'Maintenance' :
                          currentRental.scooter?.status === 'OFFLINE' ? 'Offline/Disabled' : 'Unknown status'}<br />
                    Battery: <FaBatteryThreeQuarters className="text-success" /> {currentRental.scooter?.batteryLevel || 0}%
                  </p>
                </div>
                <div className="mb-3">
                  <FaMapMarkerAlt className="me-2 text-primary" />
                  <strong>Location Info</strong>
                  <p className="ms-4 mb-2">
                    Start Location: {currentRental.startLocation || 'Unknown location'}<br />
                    Current Location: {currentRental.scooter?.location || 'Unknown location'}<br />
                    {currentRental.scooter?.latitude && currentRental.scooter?.longitude && (
                      <>Coordinates: {currentRental.scooter.latitude}, {currentRental.scooter.longitude}</>
                    )}
                  </p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <FaClock className="me-2 text-primary" />
                  <strong>Rental Info</strong>
                  <p className="ms-4 mb-2">
                    Start Time: {new Date(currentRental.startTime).toLocaleString()}<br />
                    Plan: {currentRental.plan === 'DAILY' ? 'Daily' : 
                             currentRental.plan === 'WEEKLY' ? 'Weekly' : 
                             currentRental.plan === 'FOUR_HOURS' ? '4-Hour Package' : 'Hourly'}<br />
                    Duration: {formatDuration(currentRental.startTime, currentRental.endTime, currentRental)}
                  </p>
                </div>
                <div className="mb-3">
                  <FaMoneyBillWave className="me-2 text-primary" />
                  <strong>Cost Info</strong>
                  <p className="ms-4 mb-2">
                    Current Cost: <span className="text-success fw-bold">¥{currentRental.totalCost?.toFixed(2) || '0.00'}</span>
                  </p>
                </div>
              </Col>
            </Row>
            <div className="mt-3">
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    resetState();
                    setShowExtendModal(true);
                  }}
                  disabled={currentRental?.status !== 'ACTIVE' || processing}
                >
                  <FaClock className="me-2" />
                  Extend Rental
                </Button>
                <Button
                  variant="warning"
                  onClick={() => {
                    resetState();
                    setShowEndModal(true);
                  }}
                  disabled={currentRental?.status !== 'ACTIVE' || processing}
                >
                  <FaStop className="me-2" />
                  End Rental
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    resetState();
                    setShowCancelModal(true);
                  }}
                  disabled={currentRental?.status !== 'ACTIVE' || processing}
                >
                  <FaBan className="me-2" />
                  Cancel Rental
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="info">
          No active rentals at the moment.
        </Alert>
      )}

      {recentRentals.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-3">
            <FaHistory className="me-2" />
            Recent Rental Records
          </h4>
          <Row>
            {recentRentals.map(rental => (
              <Col md={4} key={rental.id} className="mb-3">
                <Card className="h-100 rental-history-card">
                  <Card.Header className="bg-light">
                    <small className="text-muted">
                      {new Date(rental.startTime).toLocaleDateString()}
                    </small>
                  </Card.Header>
                  <Card.Body>
                    <p className="mb-2">
                      <FaMotorcycle className="me-2" />
                      {rental.scooter?.model || 'E-Scooter'}
                    </p>
                    <p className="mb-2">
                      <FaClock className="me-2" />
                      {formatDuration(rental.startTime, rental.endTime, rental)}
                    </p>
                    <p className="mb-0 text-success">
                      <FaMoneyBillWave className="me-2" />
                      ¥{rental.totalCost?.toFixed(2) || '0.00'}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* 延长租赁时间弹窗 */}
      <Modal show={showExtendModal} onHide={() => !processing && setShowExtendModal(false)}>
        <Modal.Header closeButton={!processing}>
          <Modal.Title>Extend Rental</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && renderErrorWithRetry('extend')}
          <Form>
            <Form.Group>
              <Form.Label>Extension Time ({getPlanDescription()})</Form.Label>
              <InputGroup>
                <Button
                  variant="outline-secondary"
                  onClick={() => setExtensionHours(Math.max(getMinExtensionHours(), extensionHours - getExtensionStep()))}
                  disabled={processing}
                >
                  <FaMinus />
                </Button>
                <Form.Control
                  type="number"
                  min={getMinExtensionHours()}
                  max={getMaxExtensionHours()}
                  step={getExtensionStep()}
                  value={extensionHours}
                  onChange={(e) => setExtensionHours(Math.max(getMinExtensionHours(), parseInt(e.target.value) || getMinExtensionHours()))}
                  disabled={processing}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setExtensionHours(Math.min(getMaxExtensionHours(), extensionHours + getExtensionStep()))}
                  disabled={processing}
                >
                  <FaPlus />
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                {currentRental?.plan === 'WEEKLY' ? 'Up to 7 days per extension' :
                 currentRental?.plan === 'FOUR_HOURS' ? 'Up to 4 hours per extension' :
                 'Up to 24 hours per extension'}
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExtendModal(false)} disabled={processing}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleExtend} disabled={processing}>
            {processing ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Processing...
              </>
            ) : 'Confirm Extension'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 结束租赁弹窗 */}
      <Modal show={showEndModal} onHide={() => !processing && setShowEndModal(false)}>
        <Modal.Header closeButton={!processing}>
          <Modal.Title>End Rental</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && renderErrorWithRetry('end')}
          <p>Are you sure you want to end the current rental? The system will calculate the cost based on actual usage time.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEndModal(false)} disabled={processing}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleEnd} disabled={processing}>
            {processing ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Processing...
              </>
            ) : 'Confirm End'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 取消租赁弹窗 */}
      <Modal show={showCancelModal} onHide={() => !processing && setShowCancelModal(false)}>
        <Modal.Header closeButton={!processing}>
          <Modal.Title>Cancel Rental</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && renderErrorWithRetry('cancel')}
          <p>
            You can cancel for free within 5 minutes after the rental starts. After 5 minutes, please choose "End Rental".
            <br />
            Are you sure you want to cancel the current rental?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)} disabled={processing}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleCancel} disabled={processing}>
            {processing ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Processing...
              </>
            ) : 'Confirm Cancel'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RentalManagement; 