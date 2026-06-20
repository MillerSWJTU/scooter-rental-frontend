import React, { useState, useEffect } from 'react';  
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaBatteryThreeQuarters, FaMapMarkerAlt, FaClock, FaTools, FaWifi } from 'react-icons/fa';
import { Badge } from 'react-bootstrap';
import Map from '../common/Map';  
import ScooterService from '../../services/scooter.service';  
import '../../styles/components/ScooterDetails.css';  

const DEFAULT_COORDINATES = [30.657, 104.066]; // Default coordinates for Chengdu

const ScooterDetails = () => {  
  const { id } = useParams();  
  const navigate = useNavigate();  
  const [scooter, setScooter] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  
  const [mapCenter, setMapCenter] = useState(DEFAULT_COORDINATES);

  useEffect(() => {  
    const fetchScooterDetails = async () => {  
      try {  
        setLoading(true);  
        setError(null);
        
        if (!id) {
          throw new Error('Scooter ID cannot be empty');
        }
        
        const response = await ScooterService.getScooterById(id);  
        setScooter(response);  
        
        // Set map center point
        if (response?.latitude && response?.longitude) {
          setMapCenter([response.latitude, response.longitude]);
        } else {
          setMapCenter(DEFAULT_COORDINATES);
        }
      } catch (err) {
        console.error('Error fetching scooter details:', err);
        setError(err.message || 'Failed to fetch scooter details');
      } finally {
        setLoading(false);
      }
    };  

    fetchScooterDetails();  
  }, [id]);  

  const handleRentClick = (e) => {
    e.preventDefault();
    navigate(`/scooters/${id}/rent`);
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

  const getRentButtonConfig = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          text: 'Rent Now',
          disabled: false,
          style: {
            backgroundColor: '#007bff',
            opacity: 1
          }
        };
      case 'RENTED':
        return {
          text: 'Currently Rented',
          disabled: true,
          style: {
            backgroundColor: '#ffc107',
            color: '#212529',
            opacity: 0.8
          }
        };
      case 'MAINTENANCE':
        return {
          text: 'Under Maintenance',
          disabled: true,
          style: {
            backgroundColor: '#dc3545',
            opacity: 0.8
          }
        };
      case 'OFFLINE':
        return {
          text: 'Unavailable',
          disabled: true,
          style: {
            backgroundColor: '#6c757d',
            opacity: 0.8
          }
        };
      default:
        return {
          text: 'Unavailable',
          disabled: true,
          style: {
            backgroundColor: '#6c757d',
            opacity: 0.8
          }
        };
    }
  };  

  if (loading) {  
    return (  
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading scooter information...</p>
      </div>
    );
  }

  if (error) {
    return (  
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <Link to="/scooters" className="btn btn-primary">
          Return to Scooter List
        </Link>
      </div>  
    );  
  }  

  if (!scooter) {
    return (  
      <div className="error-container">
        <h3>Scooter Not Found</h3>
        <p>Unable to find scooter with ID: {id}</p>
        <Link to="/scooters" className="btn btn-primary">
          Return to Scooter List
        </Link>
      </div>  
    );
  }

  const buttonConfig = getRentButtonConfig(scooter.status);

  return (
    <div className="scooter-details-container">
      {/* Top Navigation Bar */}
      <div className="details-header">
        <Link to="/scooters" className="back-link">
          ← Back to List
        </Link>
        <button
          onClick={handleRentClick}
          disabled={buttonConfig.disabled}
          style={{
            ...buttonConfig.style,
            padding: '8px 20px',
            borderRadius: '4px',
            border: 'none',
            cursor: buttonConfig.disabled ? 'not-allowed' : 'pointer'
          }}
        >
          {buttonConfig.text}
        </button>
      </div>  
          
      {/* Scooter Information Card */}
      <div className="scooter-info-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">{scooter.model}</h5>
          {getStatusBadge(scooter.status)}
        </div>  
        <div className="info-grid">
          <div className="info-item">
            <FaMapMarkerAlt className="info-icon location" />
            <span>Current Location: {scooter.location || 'Unknown Location'}</span>
          </div>  
          <div className="info-item">
            <FaBatteryThreeQuarters className={`info-icon battery-${scooter.batteryLevel >= 70 ? 'high' : scooter.batteryLevel >= 30 ? 'medium' : 'low'}`} />
            <span>Battery Level: {scooter.batteryLevel || 0}%</span>
          </div>  
          {getStatusIcon(scooter.status) && (
            <div className="info-item">
              {getStatusIcon(scooter.status)}
              <span>{buttonConfig.text}</span>
            </div>  
          )}  
        </div>  
      </div>  
                  
      {/* Map Area */}
      <div className="map-container">
        <Map
          height="100%"
          center={mapCenter}
          zoom={15}
          showControls={true}
          markers={[{
            position: mapCenter,
            scooter: scooter
          }]}
          selectedScooterId={scooter.id}
        />
      </div>  
    </div>  
  );  
};  

export default ScooterDetails;