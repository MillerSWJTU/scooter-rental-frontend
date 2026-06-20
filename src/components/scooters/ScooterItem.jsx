import React from 'react';  
import { Card, Badge, Button, ProgressBar } from 'react-bootstrap';  
import { FaBatteryThreeQuarters, FaMapMarkerAlt, FaClock, FaInfoCircle, FaTools, FaWifi } from 'react-icons/fa';  
import { useNavigate } from 'react-router-dom';  
import '../../styles/components/ScooterItem.css';  

const ScooterItem = ({ scooter, onClick, showDetailButton = true }) => {  
  const navigate = useNavigate();  
  
  // Helper functions for display  
  const getBatteryVariant = (level) => {  
    if (level >= 70) return 'success';  
    if (level >= 30) return 'warning';  
    return 'danger';  
  };  
  
  const getStatusBadge = (status) => {  
    switch (status) {  
      case 'AVAILABLE':  
        return <Badge bg="success">Available</Badge>;  
      case 'RENTED':  
        return <Badge bg="warning" text="dark">Rented</Badge>;  
      case 'MAINTENANCE':  
        return <Badge bg="danger">Maintenance</Badge>;  
      case 'OFFLINE':  
        return <Badge bg="secondary">Offline/Disabled</Badge>;  
      default:  
        return <Badge bg="secondary">{status}</Badge>;  
    }  
  };  
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return null;
      case 'RENTED':
        return <FaClock className="status-icon rented" />;
      case 'MAINTENANCE':
        return <FaTools className="status-icon maintenance" />;
      case 'OFFLINE':
        return <FaWifi className="status-icon offline" />;
      default:
        return null;
    }  
  };  
  
  const formatDistance = (distance) => {  
    if (distance < 1) {  
      return `${(distance * 1000).toFixed(0)}m`;  
    }  
    return `${distance.toFixed(1)}km`;  
  };  
  
  const handleViewDetails = (e) => {  
    e.stopPropagation();  
    navigate(`/scooters/${scooter.id}`);  
  };  
  
  const handleRentNow = (e) => {  
    e.stopPropagation();  
    navigate(`/scooters/${scooter.id}/rent`);  
  };  

  return (  
    <Card   
      className={`scooter-item ${scooter.status !== 'AVAILABLE' ? 'unavailable' : ''}`}   
      onClick={onClick}  
    >  
      <div className="scooter-image">  
        <img   
          src={scooter.imageUrl || '/images/default-scooter.jpg'}   
          alt={`${scooter.model} E-Scooter`}   
        />  
        <div className="scooter-status">  
          {getStatusBadge(scooter.status)}  
        </div>  
        {getStatusIcon(scooter.status)}
      </div>  
      
      <Card.Body>  
        <div className="d-flex justify-content-between align-items-start mb-2">  
          <Card.Title className="mb-0">{scooter.model}</Card.Title>  
          <span className="scooter-id">{scooter.serialNumber}</span>  
        </div>  
        
        <div className="scooter-location mb-3">  
          <FaMapMarkerAlt className="location-icon" />  
          <span>{scooter.location || 'Unknown location'}</span>  
          {scooter.distance && (  
            <span className="distance">· {formatDistance(scooter.distance)}</span>  
          )}  
        </div>  
        
        <div className="battery-info mb-3">  
          <div className="d-flex justify-content-between align-items-center mb-1">  
            <span className="battery-label">  
              <FaBatteryThreeQuarters className="me-1" /> Battery  
            </span>  
            <span className="battery-percentage">{scooter.batteryLevel}%</span>  
          </div>  
          <ProgressBar   
            variant={getBatteryVariant(scooter.batteryLevel)}   
            now={scooter.batteryLevel}   
          />  
        </div>  
        
        <div className="pricing-info">  
          <div className="d-flex justify-content-between pricing-row">  
            <span className="price-label"><FaClock className="me-1" /> 1 hour</span>  
            <span className="price-value">¥{scooter.pricePerHour}</span>  
          </div>  
          <div className="d-flex justify-content-between pricing-row">  
            <span className="price-label"><FaClock className="me-1" /> 4 hours</span>  
            <span className="price-value">¥{scooter.pricePerFourHours}</span>  
          </div>  
          <div className="d-flex justify-content-between pricing-row">  
            <span className="price-label"><FaClock className="me-1" /> 1 day</span>  
            <span className="price-value">¥{scooter.pricePerDay}</span>  
          </div>  
          <div className="d-flex justify-content-between pricing-row">  
            <span className="price-label"><FaClock className="me-1" /> 1 week</span>  
            <span className="price-value">¥{scooter.pricePerWeek}</span>  
          </div>  
        </div>  
        
        {showDetailButton && (  
          <div className="d-flex justify-content-between align-items-center mt-3">  
            <Button variant="outline-primary" size="sm" onClick={handleViewDetails}>  
              <FaInfoCircle className="me-1" /> View Details  
            </Button>  
            <Button
              variant="primary"
              size="sm"
              onClick={handleRentNow}
              disabled={scooter.status !== 'AVAILABLE'}
            >
              {scooter.status === 'AVAILABLE' ? 'Rent Now' : 'Unavailable'}
            </Button>
          </div>  
        )}  
      </Card.Body>  
    </Card>  
  );  
};  

export default ScooterItem;