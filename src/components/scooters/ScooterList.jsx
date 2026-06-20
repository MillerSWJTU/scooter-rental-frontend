import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaMapMarkerAlt, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ScooterItem from './ScooterItem';
import Map from '../common/Map';
import ScooterService from '../../services/scooter.service';
import '../../styles/components/ScooterList.css';
import scooterImage from '../../assets/images/scooter.jpg';

const ScooterList = () => {
  const [scooters, setScooters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    minBattery: 0,
    onlyAvailable: false,
    sortBy: 'distance'
  });
  const [selectedScooter, setSelectedScooter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchScooters();
  }, [filters]);

  const fetchScooters = async () => {
    try {
      setLoading(true);
      const scootersData = await ScooterService.getAllScooters();
      setScooters(Array.isArray(scootersData) ? scootersData : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching scooters:', err);
      setError('Failed to fetch scooter list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleScooterClick = (scooter) => {
    setSelectedScooter(scooter);
    navigate(`/scooters/${scooter.id}`);
  };

  const handleMapScooterSelect = (scooter) => {
    setSelectedScooter(scooter);
  };

  const filteredScooters = scooters
    .filter(scooter => {
      if (filters.location && !scooter.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      
      if (scooter.batteryLevel < filters.minBattery) {
        return false;
      }
      
      if (filters.onlyAvailable && scooter.status !== 'AVAILABLE') {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
    switch (filters.sortBy) {
      case 'distance':
          return (a.distance || 0) - (b.distance || 0);
      case 'price':
        return a.pricePerHour - b.pricePerHour;
      case 'battery':
        return b.batteryLevel - a.batteryLevel;
      default:
        return 0;
    }
  });

  return (
    <Container className="py-4">
      <h1 className="mb-4">Scooter List</h1>
      <Row className="mb-4">
        <Col md={8}>
          <p className="text-muted">
            Find nearby e-scooters and choose the best way to travel.
          </p>
        </Col>
        <Col md={4} className="text-end">
          <Button
            variant={showMap ? "primary" : "outline-primary"}
            onClick={() => setShowMap(!showMap)}
            className="view-toggle-btn"
          >
            <FaMapMarkerAlt className="me-2" />
            {showMap ? "List View" : "Map View"}
          </Button>
        </Col>
      </Row>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading...</p>
        </div>
      ) : error ? (
        <Alert variant="warning">
          {error}
        </Alert>
      ) : showMap ? (
        <Map
          height="600px"
          onScooterSelect={handleMapScooterSelect}
          selectedScooterId={selectedScooter?.id}
        />
      ) : (
        <Row>
          {filteredScooters.length === 0 ? (
            <Col>
              <Alert variant="info">
                No scooters found matching your criteria.
              </Alert>
            </Col>
          ) : (
            filteredScooters.map(scooter => (
              <Col key={scooter.id} lg={4} md={6} className="mb-4">
                <ScooterItem
                  scooter={{
                    ...scooter,
                    imageUrl: scooterImage
                  }}
                  onClick={() => handleScooterClick(scooter)}
                  showDetailButton={true}
                />
              </Col>
            ))
          )}
        </Row>
      )}
    </Container>
  );
};

export default ScooterList;