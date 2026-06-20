import React, { useState, useEffect } from 'react';  
import {   
  Container, Row, Col, Card, Badge, Button, Tab, Tabs,   
  Alert, Spinner, ListGroup, Modal  
} from 'react-bootstrap';  
import {   
  FaClockHistory, FaCheck, FaMapMarkedAlt, FaMotorcycle,   
  FaLock, FaUnlock, FaQrcode, FaInfoCircle, FaRegStar,  
  FaTimes, FaExclamationTriangle, FaStar, FaCheckCircle  
} from 'react-icons/fa';  
import { Link } from 'react-router-dom';  
import { useAuth } from '../../contexts/AuthContext';  
import { useRental } from '../../contexts/RentalContext';  
import RentalService from '../../services/rental.service';  
import QRCode from 'react-qr-code';  
import '../../styles/components/UserRentals.css';  

const UserRentals = () => {  
  const { user } = useAuth();  
  const { rentals, updateRental } = useRental();  
  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  
  const [activeTab, setActiveTab] = useState('active');  
  const [showUnlockModal, setShowUnlockModal] = useState(false);  
  const [showReturnModal, setShowReturnModal] = useState(false);  
  const [showRatingModal, setShowRatingModal] = useState(false);  
  const [selectedRental, setSelectedRental] = useState(null);  
  const [processingAction, setProcessingAction] = useState(false);  
  const [rating, setRating] = useState(5);  
  const [review, setReview] = useState('');  
  
  useEffect(() => {  
    const fetchRentals = async () => {  
      try {  
        setLoading(true);  
        // In a real app, fetch from API if not already in context  
        if (rentals.length === 0) {  
          const response = await RentalService.getUserRentals(user.id);  
          // The useRental context would typically handle this  
        }  
      } catch (err) {  
        console.error('Error fetching rentals:', err);  
        setError('获取租赁记录失败，请稍后重试');  
      } finally {  
        setLoading(false);  
      }  
    };  

    if (user) {  
      fetchRentals();  
    }  
  }, [user]);  
  
  // Process categories  
  const activeRentals = rentals.filter(r => r.status === 'active' || r.status === 'unlocked');  
  const completedRentals = rentals.filter(r => r.status === 'completed');  
  const cancelledRentals = rentals.filter(r => r.status === 'cancelled');  
  
  const handleUnlock = (rental) => {  
    setSelectedRental(rental);  
    setShowUnlockModal(true);  
  };  
  
  const handleReturn = (rental) => {  
    setSelectedRental(rental);  
    setShowReturnModal(true);  
  };  
  
  const handleRate = (rental) => {  
    setSelectedRental(rental);  
    setRating(5);  
    setReview('');  
    setShowRatingModal(true);  
  };  
  
  const processUnlock = async () => {  
    try {  
      setProcessingAction(true);  
      // In a real app, send unlock command to the scooter  
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating API call  
      
      // Update rental status  
      const updatedRental = { ...selectedRental, status: 'unlocked' };  
      await RentalService.updateRental(updatedRental.id, updatedRental);  
      updateRental(updatedRental);  
      
      setShowUnlockModal(false);  
      setSelectedRental(null);  
    } catch (err) {  
      console.error('Error unlocking scooter:', err);  
      alert('解锁滑板车失败，请重试或联系客服');  
    } finally {  
      setProcessingAction(false);  
    }  
  };  
  
  const processReturn = async () => {  
    try {  
      setProcessingAction(true);  
      // In a real app, send return command to the scooter  
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating API call  
      
      // Update rental status  
      const updatedRental = { ...selectedRental, status: 'completed', endTime: new Date().toISOString() };  
      await RentalService.updateRental(updatedRental.id, updatedRental);  
      updateRental(updatedRental);  
      
      setShowReturnModal(false);  
      setSelectedRental(null);  
      setShowRatingModal(true);  
    } catch (err) {  
      console.error('Error returning scooter:', err);  
      alert('归还滑板车失败，请重试或联系客服');  
    } finally {  
      setProcessingAction(false);  
    }  
  };  
  
  const submitRating = async () => {  
    try {  
      setProcessingAction(true);  
      // In a real app, send rating to the API  
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call  
      
      // Update rental with rating  
      const updatedRental = { ...selectedRental, rating, review };  
      await RentalService.updateRental(updatedRental.id, updatedRental);  
      updateRental(updatedRental);  
      
      setShowRatingModal(false);  
      setSelectedRental(null);  
    } catch (err) {  
      console.error('Error submitting rating:', err);  
      alert('提交评价失败，请稍后重试');  
    } finally {  
      setProcessingAction(false);  
    }  
  };  
  
  const formatDuration = (rental) => {  
    if (!rental.startTime) return '-';  
    
    const start = new Date(rental.startTime);  
    const end = rental.endTime ? new Date(rental.endTime) : new Date();  
    const durationMs = end - start;  
    const hours = Math.floor(durationMs / (1000 * 60 * 60));  
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));  
    
    return `${hours}小时 ${minutes}分钟`;  
  };  
  
  const formatDateTime = (dateString) => {  
    if (!dateString) return '-';  
    return new Date(dateString).toLocaleString();  
  };  
  
  const getStatusBadge = (status) => {  
    switch (status) {  
      case 'active':  
        return <Badge bg="warning" text="dark">待取车</Badge>;  
      case 'unlocked':  
        return <Badge bg="success">使用中</Badge>;  
      case 'completed':  
        return <Badge bg="primary">已完成</Badge>;  
      case 'cancelled':  
        return <Badge bg="danger">已取消</Badge>;  
      default:  
        return <Badge bg="secondary">{status}</Badge>;  
    }  
  };  
  
  const renderStarRating = (currentRating) => {  
    const stars = [];  
    for (let i = 1; i <= 5; i++) {  
      stars.push(  
        <span   
          key={i}   
          onClick={() => !processingAction && setRating(i)}  
          className={`star-rating-item ${i <= currentRating ? 'active' : ''}`}  
        >  
          {i <= currentRating ? <FaStar /> : <FaRegStar />}  
        </span>  
      );  
    }  
    return stars;  
  };  
  
  const renderRentalCard = (rental) => {  
    return (  
      <Card className="rental-card mb-3">  
        <Card.Body>  
          <div className="d-flex justify-content-between align-items-start">  
            <div>  
              <div className="scooter-model">{rental.scooter?.model || '电动滑板车'}</div>  
              <div className="scooter-id">{rental.scooter?.id || rental.scooterId}</div>  
            </div>  
            <div>{getStatusBadge(rental.status)}</div>  
          </div>  
          
          <ListGroup variant="flush" className="rental-details mt-3">  
            <ListGroup.Item className="d-flex justify-content-between px-0 py-2">  
              <span>开始时间</span>  
              <strong>{formatDateTime(rental.startTime)}</strong>  
            </ListGroup.Item>  
            
            {rental.status === 'completed' && (  
              <ListGroup.Item className="d-flex justify-content-between px-0 py-2">  
                <span>结束时间</span>  
                <strong>{formatDateTime(rental.endTime)}</strong>  
              </ListGroup.Item>  
            )}  
            
            <ListGroup.Item className="d-flex justify-content-between px-0 py-2">  
              <span>使用时长</span>  
              <strong>{formatDuration(rental)}</strong>  
            </ListGroup.Item>  
            
            <ListGroup.Item className="d-flex justify-content-between px-0 py-2">  
              <span>费用</span>  
              <strong className="text-primary">¥{rental.cost?.toFixed(2)}</strong>  
            </ListGroup.Item>  
            
            {rental.location && (  
              <ListGroup.Item className="d-flex justify-content-between px-0 py-2">  
                <span>位置</span>  
                <strong>{rental.location}</strong>  
              </ListGroup.Item>  
            )}  
          </ListGroup>  
          
          {rental.status === 'active' && (  
            <div className="d-grid gap-2 mt-3">  
              <Button   
                variant="primary"   
                onClick={() => handleUnlock(rental)}  
              >  
                <FaUnlock className="me-2" />  
                解锁滑板车  
              </Button>  
              <Button   
                variant="outline-secondary"   
                size="sm"  
              >  
                <FaQrcode className="me-2" />  
                扫描二维码解锁  
              </Button>  
            </div>  
          )}  
          
          {rental.status === 'unlocked' && (  
            <div className="d-grid mt-3">  
              <Button   
                variant="primary"   
                onClick={() => handleReturn(rental)}  
              >  
                <FaCheck className="me-2" />  
                完成租赁并归还  
              </Button>  
            </div>  
          )}  
          
          {rental.status === 'completed' && !rental.rating && (  
            <div className="d-grid mt-3">  
              <Button   
                variant="outline-primary"   
                onClick={() => handleRate(rental)}  
              >  
                <FaStar className="me-2" />  
                评价此次租赁  
              </Button>  
            </div>  
          )}  
          
          {rental.rating && (  
            <div className="rating-summary mt-3">  
              <div className="d-flex mb-1">  
                {Array.from({ length: 5 }).map((_, i) => (  
                  <FaStar   
                    key={i}   
                    className={i < rental.rating ? 'text-warning' : 'text-muted'}   
                  />  
                ))}  
              </div>  
              {rental.review && <p className="review-text mb-0">{rental.review}</p>}  
            </div>  
          )}  
        </Card.Body>  
      </Card>  
    );  
  };  

  return (  
    <Container className="user-rentals-container py-5">  
      <h1 className="mb-4">我的租赁</h1>  
      
      {loading ? (  
        <div className="text-center py-5">  
          <Spinner animation="border" variant="primary" />  
          <p className="mt-3">加载租赁记录中...</p>  
        </div>  
      ) : error ? (  
        <Alert variant="danger">  
          <FaExclamationTriangle className="me-2" />  
          {error}  
        </Alert>  
      ) : rentals.length === 0 ? (  
        <Card className="border-0 shadow-sm">  
          <Card.Body className="text-center py-5">  
            <FaMotorcycle size={48} className="text-muted mb-3" />  
            <h5>您还没有任何租赁记录</h5>  
            <p className="text-muted">开始您的第一次电动滑板车租赁之旅吧！</p>  
            <Button   
              as={Link}   
              to="/scooters"   
              variant="primary"  
              className="mt-2"  
            >  
              浏览可用滑板车  
            </Button>  
          </Card.Body>  
        </Card>  
      ) : (  
        <>  
          <Tabs  
            activeKey={activeTab}  
            onSelect={(k) => setActiveTab(k)}  
            className="mb-4"  
          >  
            <Tab eventKey="active" title={`当前租赁 (${activeRentals.length})`}>  
              {activeRentals.length === 0 ? (  
                <Alert variant="info">  
                  <FaInfoCircle className="me-2" />  
                  您当前没有进行中的租赁。  
                </Alert>  
              ) : (  
                <Row>  
                  {activeRentals.map(rental => (  
                    <Col md={6} lg={4} key={rental.id} className="mb-3">  
                      {renderRentalCard(rental)}  
                    </Col>  
                  ))}  
                </Row>  
              )}  
            </Tab>  
            
            <Tab eventKey="completed" title={`已完成 (${completedRentals.length})`}>  
              {completedRentals.length === 0 ? (  
                <Alert variant="info">  
                  <FaInfoCircle className="me-2" />  
                  您没有已完成的租赁记录。  
                </Alert>  
              ) : (  
                <Row>  
                  {completedRentals.map(rental => (  
                    <Col md={6} lg={4} key={rental.id} className="mb-3">  
                      {renderRentalCard(rental)}  
                    </Col>  
                  ))}  
                </Row>  
              )}  
            </Tab>  
            
            <Tab eventKey="cancelled" title={`已取消 (${cancelledRentals.length})`}>  
              {cancelledRentals.length === 0 ? (  
                <Alert variant="info">  
                  <FaInfoCircle className="me-2" />  
                  您没有已取消的租赁记录。  
                </Alert>  
              ) : (  
                <Row>  
                  {cancelledRentals.map(rental => (  
                    <Col md={6} lg={4} key={rental.id} className="mb-3">  
                      {renderRentalCard(rental)}  
                    </Col>  
                  ))}  
                </Row>  
              )}  
            </Tab>  
          </Tabs>  
        </>  
      )}  
      
      {/* Unlock Modal */}  
      <Modal   
        show={showUnlockModal}   
        onHide={() => !processingAction && setShowUnlockModal(false)}  
        centered  
      >  
        <Modal.Header closeButton>  
          <Modal.Title>解锁滑板车</Modal.Title>  
        </Modal.Header>  
        <Modal.Body>  
          {processingAction ? (  
            <div className="text-center py-4">  
              <Spinner animation="border" variant="primary" />  
              <p className="mt-3">正在连接滑板车...</p>  
            </div>  
          ) : (  
            <>  
              <Alert variant="info" className="mb-4">  
                <FaInfoCircle className="me-2" />  
                请确保您已经在滑板车附近，然后点击下方的解锁按钮。  
              </Alert>  
              
              <div className="text-center mb-4">  
                <div className="qr-code-container mb-3">  
                  <QRCode   
                    value={`unlock:${selectedRental?.scooterId || 'SC001'}`}  
                    size={160}  
                  />  
                </div>  
                <div className="small text-muted">  
                  您也可以扫描滑板车上的二维码解锁  
                </div>  
              </div>  
              
              <div className="scooter-unlock-details">  
                <div><strong>滑板车：</strong> {selectedRental?.scooter?.model || '电动滑板车'}</div>  
                <div><strong>编号：</strong> {selectedRental?.scooter?.id || selectedRental?.scooterId}</div>  
                <div><strong>位置：</strong> {selectedRental?.location || '未知位置'}</div>  
              </div>  
            </>  
          )}  
        </Modal.Body>  
        {!processingAction && (  
          <Modal.Footer>  
            <Button   
              variant="outline-secondary"   
              onClick={() => setShowUnlockModal(false)}  
            >  
              取消  
            </Button>  
            <Button   
              variant="primary"  
              onClick={processUnlock}  
            >  
              <FaUnlock className="me-2" />  
              解锁滑板车  
            </Button>  
          </Modal.Footer>  
        )}  
      </Modal>  
      
      {/* Return Modal */}  
      <Modal   
        show={showReturnModal}   
        onHide={() => !processingAction && setShowReturnModal(false)}  
        centered  
      >  
        <Modal.Header closeButton>  
          <Modal.Title>归还滑板车</Modal.Title>  
        </Modal.Header>  
        <Modal.Body>  
          {processingAction ? (  
            <div className="text-center py-4">  
              <Spinner animation="border" variant="primary" />  
              <p className="mt-3">正在处理归还请求...</p>  
            </div>  
          ) : (  
            <>  
              <div className="text-center mb-4">  
                <FaMapMarkedAlt size={60} className="text-primary mb-3" />  
                <h5>您确定要结束此次租赁并归还滑板车吗？</h5>  
              </div>  
              
              <Alert variant="warning" className="mb-4">  
                <FaExclamationTriangle className="me-2" />  
                请确保滑板车已停放在指定区域内，并且已上锁。  
              </Alert>  
              
              <div className="rental-return-summary">  
                <div className="d-flex justify-content-between mb-2">  
                  <span>滑板车：</span>  
                  <strong>{selectedRental?.scooter?.model || '电动滑板车'}</strong>  
                </div>  
                <div className="d-flex justify-content-between mb-2">  
                  <span>编号：</span>  
                  <strong>{selectedRental?.scooter?.id || selectedRental?.scooterId}</strong>  
                </div>  
                <div className="d-flex justify-content-between mb-2">  
                  <span>开始时间：</span>  
                  <strong>{formatDateTime(selectedRental?.startTime)}</strong>  
                </div>  
                <div className="d-flex justify-content-between mb-2">  
                  <span>使用时长：</span>  
                  <strong>{formatDuration(selectedRental || {})}</strong>  
                </div>  
                <div className="d-flex justify-content-between">  
                  <span>预计费用：</span>  
                  <strong className="text-primary">¥{selectedRental?.cost?.toFixed(2) || '0.00'}</strong>  
                </div>  
              </div>  
            </>  
          )}  
        </Modal.Body>  
        {!processingAction && (  
          <Modal.Footer>  
            <Button   
              variant="outline-secondary"   
              onClick={() => setShowReturnModal(false)}  
            >  
              取消  
            </Button>  
            <Button   
              variant="primary"  
              onClick={processReturn}  
            >  
              <FaCheck className="me-2" />  
              确认归还  
            </Button>  
          </Modal.Footer>  
        )}  
      </Modal>  
      
      {/* Rating Modal */}  
      <Modal   
        show={showRatingModal}   
        onHide={() => !processingAction && setShowRatingModal(false)}  
        centered  
      >  
        <Modal.Header closeButton>  
          <Modal.Title>评价此次租赁</Modal.Title>  
        </Modal.Header>  
        <Modal.Body>  
          {processingAction ? (  
            <div className="text-center py-4">  
              <Spinner animation="border" variant="primary" />  
              <p className="mt-3">正在提交您的评价...</p>  
            </div>  
          ) : (  
            <>  
              <div className="text-center mb-4">  
                <FaCheckCircle size={48} className="text-success mb-3" />  
                <h5>您的租赁已成功完成！</h5>  
                <p className="text-muted">请对此次租赁体验进行评价</p>  
                
                <div className="star-rating mt-4">  
                  {renderStarRating(rating)}  
                </div>  
                <div className="rating-text mt-1">  
                  {rating === 5 ? '非常满意' :   
                   rating === 4 ? '满意' :   
                   rating === 3 ? '一般' :   
                   rating === 2 ? '不满意' : '非常不满意'}  
                </div>  
              </div>  
              
              <div className="form-group mb-3">  
                <label className="form-label">您的评价（可选）</label>  
                <textarea  
                  className="form-control"  
                  rows="4"  
                  value={review}  
                  onChange={(e) => setReview(e.target.value)}  
                  placeholder="分享您的租赁体验..."  
                ></textarea>  
              </div>  
            </>  
          )}  
        </Modal.Body>  
        {!processingAction && (  
          <Modal.Footer>  
            <Button   
              variant="outline-secondary"   
              onClick={() => setShowRatingModal(false)}  
            >  
              跳过  
            </Button>  
            <Button   
              variant="primary"  
              onClick={submitRating}  
            >  
              <FaCheck className="me-2" />  
              提交评价  
            </Button>  
          </Modal.Footer>  
        )}  
      </Modal>  
    </Container>  
  );  
};  

export default UserRentals;