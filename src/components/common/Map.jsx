import React, { useState, useEffect, useRef } from 'react';  
import { Button, Spinner, Badge, Offcanvas, Form } from 'react-bootstrap';  
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';  
import L from 'leaflet';  
import 'leaflet/dist/leaflet.css';  
import { FaLocationArrow, FaFilter, FaBatteryThreeQuarters, FaTimesCircle, FaMapMarkerAlt, FaClock, FaYenSign } from 'react-icons/fa';  
import { useNavigate } from 'react-router-dom';  
import './Map.css';  
import ScooterService from '../../services/scooter.service';

// Fix Leaflet icon issue  
delete L.Icon.Default.prototype._getIconUrl;  
L.Icon.Default.mergeOptions({  
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});  

// 默认位置（成都春熙路）
const DEFAULT_LOCATION = [30.6571, 104.0870];

// 用户位置专属红色marker
const userIcon = new L.Icon({
  iconUrl: process.env.PUBLIC_URL + '/marker-icon-red.png',
  iconRetinaUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-red.png',
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const Map = ({   
  width = '100%',   
  height = '500px',   
  zoom = 14,  
  showControls = true,  
  onScooterSelect,  
  selectedScooterId = null,  
  showAllScooters = true  
}) => {  
  const [scooters, setScooters] = useState([]);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  
  const [showFilters, setShowFilters] = useState(false);  
  const [filters, setFilters] = useState({  
    minBattery: 0,  
    maxDistance: 2000,
    onlyAvailable: true  
  });  
  const [selectedMarker, setSelectedMarker] = useState(null);  
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);  
  const navigate = useNavigate();  

  // 获取用户位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting user location:', error);
          setUserLocation(DEFAULT_LOCATION); // 定位失败时兜底
        }
      );
    } else {
      setUserLocation(DEFAULT_LOCATION); // 不支持定位时兜底
    }
  }, []);

  // Fetch scooters data  
  const fetchScooters = async () => {  
    try {  
      setLoading(true);  
      setError(null);  
      // 从后端获取真实数据
      const scootersData = await ScooterService.getAllScooters();
      // 兼容后端返回的经纬度字段
      const mapped = (Array.isArray(scootersData) ? scootersData : []).map(scooter => ({
        ...scooter,
        location: scooter.latitude && scooter.longitude ? [scooter.latitude, scooter.longitude] : null,
        // 兼容status大小写
        status: (scooter.status || '').toLowerCase(),
        model: scooter.model || '未知型号',
        pricePerMinute: scooter.pricePerHour ? (scooter.pricePerHour / 60).toFixed(2) : 0,
        lastMaintenance: scooter.lastMaintenanceDate ? (typeof scooter.lastMaintenanceDate === 'string' ? scooter.lastMaintenanceDate.split('T')[0] : scooter.lastMaintenanceDate) : '',
        totalTrips: scooter.totalTrips || 0
      })).filter(s => s.location);
      setScooters(mapped);
    } catch (error) {  
      console.error('Error fetching scooters:', error);  
      setError('获取滑板车数据失败');  
    } finally {  
      setLoading(false);  
    }  
  };  
  
  useEffect(() => {  
    fetchScooters();  
  }, [filters]);  
  
  // Apply filters  
  const filteredScooters = scooters.filter(scooter => {  
    if (filters.onlyAvailable && scooter.status !== 'available') return false;  
    if (scooter.batteryLevel < filters.minBattery) return false;  
    if (scooter.distance > filters.maxDistance) return false;  
    return true;  
  });  

  // Handle scooter selection  
  useEffect(() => {  
    if (selectedScooterId) {  
      const scooter = scooters.find(s => s.id === selectedScooterId);  
      if (scooter) {  
        setSelectedMarker(scooter);  
        if (mapRef.current) {  
          mapRef.current.flyTo(scooter.location, 18);  
        }  
      }  
    }  
  }, [selectedScooterId, scooters]);  

  // Handle marker click  
  const handleMarkerClick = (scooter) => {  
    setSelectedMarker(scooter);  
    if (onScooterSelect) {  
      onScooterSelect(scooter);  
    }  
  };  
  
  // Status badge renderer  
  const renderStatusBadge = (status) => {  
    switch (status) {  
      case 'available':  
        return <Badge bg="success">可用</Badge>;  
      case 'in_use':  
        return <Badge bg="warning" text="dark">使用中</Badge>;  
      case 'maintenance':  
        return <Badge bg="danger">维护中</Badge>;  
      case 'low_battery':  
        return <Badge bg="secondary">电量低</Badge>;  
      default:  
        return <Badge bg="light" text="dark">{status}</Badge>;  
    }  
  };  
  
  // Battery level color  
  const getBatteryColor = (level) => {  
    if (level >= 70) return 'success';  
    if (level >= 30) return 'warning';  
    return 'danger';  
  };  
  
  // Handle filter changes  
  const handleFilterChange = (field, value) => {  
    setFilters(prev => ({ ...prev, [field]: value }));  
  };  

  // Handle "Rent this scooter" button click  
  const handleRentClick = (scooterId) => {  
    navigate(`/scooters/${scooterId}/rent`);  
  };  

  // 计算距离文本
  const getDistanceText = (distance) => {
    if (distance < 1000) {
      return `${distance}米`;
    }
    return `${(distance / 1000).toFixed(1)}公里`;
  };  

  return (  
    <div style={{ width, height }} className="map-container">  
      {loading && <Spinner animation="border" className="map-loading-spinner" />}  
      
      <MapContainer   
        center={userLocation || DEFAULT_LOCATION}   
        zoom={zoom}   
        style={{ width, height }}  
        ref={mapRef}  
      >  
        <TileLayer  
          url="https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}"  
          attribution="&copy; 高德地图"  
        />  
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="text-center">
                <strong>您的当前位置</strong>
            </div>
          </Popup>
        </Marker>
        )}
        
        {/* Search radius circle */}
        {userLocation && (
        <Circle
            center={userLocation}
            radius={filters.maxDistance}
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
        />
        )}
        
        {/* Scooter markers */}  
        {filteredScooters.map(scooter => (  
          <Marker   
            key={scooter.id}   
            position={scooter.location}  
            eventHandlers={{  
              click: () => handleMarkerClick(scooter)  
            }}  
          >  
            <Popup>  
              <div className="scooter-popup">  
                <div className="scooter-popup-header">
                  <h6 className="mb-2">{scooter.model}</h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                  {renderStatusBadge(scooter.status)}  
                  <Badge  
                    bg={getBatteryColor(scooter.batteryLevel)}  
                    className="ms-2"  
                  >  
                    <FaBatteryThreeQuarters className="me-1" />  
                    {scooter.batteryLevel}%  
                  </Badge>  
                  </div>
                </div>

                <div className="scooter-popup-details">
                  <div className="detail-item">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span>距离: {getDistanceText(scooter.distance)}</span>
                  </div>
                  <div className="detail-item">
                    <FaClock className="detail-icon" />
                    <span>最近维护: {scooter.lastMaintenance}</span>
                  </div>
                  <div className="detail-item">
                    <FaYenSign className="detail-icon" />
                    <span>费率: ¥{scooter.pricePerMinute}/分钟</span>
                  </div>
                </div>

                <div className="scooter-popup-footer">
                  <small className="text-muted d-block mb-2">
                    ID: {scooter.id} | 累计骑行: {scooter.totalTrips}次
                  </small>  
                <Button  
                  variant="primary"  
                  size="sm"  
                    className="w-100"
                  onClick={() => handleRentClick(scooter.id)}  
                  disabled={scooter.status !== 'available'}  
                >  
                    {scooter.status === 'available' ? '立即租用' : '暂不可用'}
                </Button>  
                </div>
              </div>  
            </Popup>  
          </Marker>  
        ))}  
      </MapContainer>  
      
      {error && (  
        <div className="map-error-message">  
          <FaTimesCircle className="me-2" />  
          {error}
        </div>  
      )}  
      
      {showControls && (  
        <div className="map-controls">  
          <Button   
            variant="light"   
            className="map-control-btn"   
            onClick={() => {  
              if (mapRef.current) {  
                mapRef.current.flyTo(userLocation || DEFAULT_LOCATION, zoom);  
              }  
            }}  
            title="回到当前位置"
          >  
            <FaLocationArrow />  
          </Button>  
          
          <Button   
            variant="light"   
            className="map-control-btn"  
            onClick={() => setShowFilters(true)}  
            title="筛选选项"
          >  
            <FaFilter />  
          </Button>  
        </div>  
      )}  
      
      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end">  
        <Offcanvas.Header closeButton>  
          <Offcanvas.Title>筛选条件</Offcanvas.Title>  
        </Offcanvas.Header>  
        <Offcanvas.Body>  
          <Form>  
            <Form.Group className="mb-3">  
              <Form.Label>最低电量 ({filters.minBattery}%)</Form.Label>  
              <Form.Range   
                value={filters.minBattery}   
                onChange={(e) => handleFilterChange('minBattery', parseInt(e.target.value))}   
                min={0}   
                max={100}  
              />  
            </Form.Group>  
            
            <Form.Group className="mb-3">  
              <Form.Label>最大距离 ({(filters.maxDistance / 1000).toFixed(1)}km)</Form.Label>  
              <Form.Range   
                value={filters.maxDistance}   
                onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}   
                min={500}   
                max={5000}   
                step={500}  
              />  
            </Form.Group>  
            
            <Form.Group className="mb-3">  
              <Form.Check   
                type="switch"  
                id="only-available-switch"  
                label="仅显示可用车辆"  
                checked={filters.onlyAvailable}  
                onChange={(e) => handleFilterChange('onlyAvailable', e.target.checked)}  
              />  
            </Form.Group>  
          </Form>  
        </Offcanvas.Body>  
      </Offcanvas>  
    </div>  
  );  
};  

export default Map;