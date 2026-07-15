import React, { useState, useEffect } from 'react';  
import { Container, Row, Col, Card, Table, Form, Button, InputGroup, Modal, Badge, Pagination, Nav, Alert } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaExclamationTriangle, FaFileExport, FaSortAmountDown, FaSortAmountUp, FaBatteryFull, FaBatteryHalf, FaBatteryEmpty, FaLocationArrow, FaBicycle, FaQrcode } from 'react-icons/fa';  
import scooterService from '../../services/scooter.service';

const ScooterManagement = () => {  
  const [scooters, setScooters] = useState([]);  
  const [filteredScooters, setFilteredScooters] = useState([]);  
  const [searchTerm, setSearchTerm] = useState('');  
  const [currentPage, setCurrentPage] = useState(1);  
  const [scootersPerPage] = useState(10);  
  const [sortField, setSortField] = useState('id');  
  const [sortDirection, setSortDirection] = useState('asc');  
  const [showAddModal, setShowAddModal] = useState(false);  
  const [showEditModal, setShowEditModal] = useState(false);  
  const [showPriceModal, setShowPriceModal] = useState(false);  
  const [showDeleteModal, setShowDeleteModal] = useState(false);  
  const [showLocationModal, setShowLocationModal] = useState(false);  
  const [selectedScooter, setSelectedScooter] = useState(null);  
  const [scooterForm, setScooterForm] = useState({  
    model: '',  
    batteryLevel: 100,  
    status: 'AVAILABLE',
    pricePerHour: '',
    pricePerFourHours: '',
    pricePerDay: '',
    pricePerWeek: '',
    location: '',  
    latitude: '',  
    longitude: '',  
  });  
  const [activeTab, setActiveTab] = useState('all');  
  const [validated, setValidated] = useState(false);  
  const [isLoading, setIsLoading] = useState(true);  
  const [message, setMessage] = useState({ type: '', text: '' });  
  const [filterOptions, setFilterOptions] = useState({  
    status: 'all',  
    batteryLevel: 'all',  
    model: 'all'  
  });  
  
  // 获取滑板车列表  
  useEffect(() => {  
    const fetchScooters = async () => {  
      try {  
        setIsLoading(true);  
        const response = await scooterService.getAllScooters();
        console.log('Fetched scooters raw response:', response); // Log raw response
        
        // 确保响应是数组
        if (Array.isArray(response)) {
          setScooters(response);  
          setFilteredScooters(response); // Initialize filtered scooters
        } else {
          console.warn('API response is not an array:', response);
          setScooters([]);
          setFilteredScooters([]);
          setMessage({ type: 'warning', text: 'Unable to load scooter data, invalid format.' });
        }
        
        setIsLoading(false);  
      } catch (error) {  
        console.error('Failed to fetch scooter list:', error);  
        setScooters([]); // Reset to empty array on error
        setFilteredScooters([]); // Reset to empty array on error
        setMessage({ type: 'danger', text: 'Failed to fetch scooter list, please try again later.' });  
        setIsLoading(false);  
      }  
    };  
    
    fetchScooters();  
  }, []);  
  
  // 搜索和筛选逻辑  
  useEffect(() => {  
    const filterScooters = () => {  
      console.log('Scooters state before filtering/sorting:', scooters); // Log state before processing
      if (!Array.isArray(scooters)) { 
        setFilteredScooters([]);
        return;
      }

      // 过滤掉无效的数据
      let filtered = scooters.filter(scooter => scooter && scooter.id);

      try {
        // 根据Tab过滤  
        if (activeTab !== 'all') {  
          filtered = filtered.filter(scooter => scooter.status === activeTab);
        }  
        
        // 搜索过滤  
        if (searchTerm) {  
          const lowerSearchTerm = searchTerm.toLowerCase();
          filtered = filtered.filter(scooter => {  
            const id = scooter.id.toString();
            const model = scooter.model?.toString() || '';
            return id.toLowerCase().includes(lowerSearchTerm) ||  
                   model.toLowerCase().includes(lowerSearchTerm);  
          });  
        }  
        
        // 状态过滤  
        if (filterOptions.status !== 'all') {  
          filtered = filtered.filter(scooter => scooter.status === filterOptions.status);
        }  
        
        // 电量过滤  
        if (filterOptions.batteryLevel !== 'all') {  
          filtered = filtered.filter(scooter => {
            const batteryLevel = scooter.batteryLevel || 0;
            if (filterOptions.batteryLevel === 'high') return batteryLevel >= 80;  
            if (filterOptions.batteryLevel === 'medium') return batteryLevel >= 30 && batteryLevel < 80;  
            if (filterOptions.batteryLevel === 'low') return batteryLevel < 30;  
            return false;
          });
        }  
        
        // 型号过滤  
        if (filterOptions.model !== 'all') {  
          filtered = filtered.filter(scooter => scooter.model === filterOptions.model);
        }
        
        // 深拷贝用于排序，避免直接修改状态
        let sortedFiltered = [...filtered];

        // 排序  
        sortedFiltered.sort((a, b) => {  
          let comparison = 0;  
          
          try {
            if (sortField === 'id') {  
              comparison = a.id.toString().localeCompare(b.id.toString());
            } else if (sortField === 'model') {  
              comparison = (a.model || '').localeCompare(b.model || '');
            } else if (sortField === 'batteryLevel') {  
              comparison = (a.batteryLevel || 0) - (b.batteryLevel || 0);  
            } else if (sortField === 'pricePerHour') {  
              comparison = parseFloat(a.pricePerHour || 0) - parseFloat(b.pricePerHour || 0);  
            } else if (sortField === 'rentalCount') {  
              comparison = (a.rentalCount || 0) - (b.rentalCount || 0);  
            } else if (sortField === 'totalRevenue') {  
              comparison = parseFloat(a.totalRevenue || 0) - parseFloat(b.totalRevenue || 0);  
            }
          } catch (sortError) {
            console.error('Error during sort comparison:', sortError, { a, b, sortField });
            comparison = 0; // Default comparison if error occurs
          }
          
          return sortDirection === 'asc' ? comparison : -comparison;  
        });

        console.log('Filtered & Sorted Scooters:', sortedFiltered); // Log processed data
        setFilteredScooters(sortedFiltered);  
        setCurrentPage(1); // Reset page on filter/sort change
      } catch (filterSortError) {
        console.error('Error during filtering/sorting scooters:', filterSortError);
        setMessage({ type: 'danger', text: '筛选或排序滑板车时出错' });
        setFilteredScooters([]); // Reset to empty on error
      }
    };
    
    filterScooters();  
  }, [scooters, activeTab, searchTerm, filterOptions, sortField, sortDirection]);  
  
  // 添加新滑板车  
  const handleAddScooter = async (e) => {  
    e.preventDefault();  
    const form = e.currentTarget;  
    
    if (form.checkValidity() === false) {  
      e.stopPropagation();  
      setValidated(true);  
      return;  
    }  
    
    try {  
      setValidated(true);
      
      // 创建一个符合后端期望的数据结构
      const scooterData = {
        ...scooterForm,
        pricePerHour: parseFloat(scooterForm.pricePerHour) || 0,
        pricePerFourHours: parseFloat(scooterForm.pricePerFourHours) || 0,
        pricePerDay: parseFloat(scooterForm.pricePerDay) || 0,
        pricePerWeek: parseFloat(scooterForm.pricePerWeek) || 0,
        batteryLevel: parseInt(scooterForm.batteryLevel) || 100,
        latitude: parseFloat(scooterForm.latitude) || 0,
        longitude: parseFloat(scooterForm.longitude) || 0
      };
      
      const newScooter = await scooterService.createScooter(scooterData);  
      
      setScooters([newScooter, ...scooters]);  
      setShowAddModal(false);  
      setMessage({ type: 'success', text: '滑板车添加成功' });  
      
      // 重置表单  
      setScooterForm({  
        model: '',  
        batteryLevel: 100,  
        status: 'AVAILABLE',
        pricePerHour: '',
        pricePerFourHours: '',
        pricePerDay: '',
        pricePerWeek: '',
        location: '',  
        latitude: '',  
        longitude: '',  
        batteryLevel: 100
      });  
      setValidated(false);  
    } catch (error) {  
      console.error('添加滑板车失败:', error);  
      setMessage({ type: 'danger', text: '添加滑板车失败，请稍后重试' });  
    }  
  };  
  
  // 编辑滑板车  
  const handleEditScooter = async (e) => {  
    e.preventDefault();  
    const form = e.currentTarget;  
    
    if (form.checkValidity() === false) {  
      e.stopPropagation();  
      setValidated(true);  
      return;  
    }  
    
    try {  
      setValidated(true);
      
      // 创建一个符合后端期望的数据结构
      const scooterData = {
        ...scooterForm,
        pricePerHour: parseFloat(scooterForm.pricePerHour) || 0,
        pricePerFourHours: parseFloat(scooterForm.pricePerFourHours) || 0,
        pricePerDay: parseFloat(scooterForm.pricePerDay) || 0,
        pricePerWeek: parseFloat(scooterForm.pricePerWeek) || 0,
        batteryLevel: parseInt(scooterForm.batteryLevel) || 100,
        latitude: parseFloat(scooterForm.latitude) || 0,
        longitude: parseFloat(scooterForm.longitude) || 0,
        status: scooterForm.status || 'AVAILABLE' // 确保状态值是后端期望的枚举值
      };
      
      // Use the single update endpoint
      const updatedScooter = await scooterService.updateScooter(selectedScooter.id, scooterData);
      
      const updatedScooters = scooters.map(scooter => {  
        if (scooter.id === selectedScooter.id) {  
          return updatedScooter; // Use the complete updated object from the single call
        }  
        return scooter;  
      });  
      
      setScooters(updatedScooters);  
      setShowEditModal(false);  
      setMessage({ type: 'success', text: '滑板车更新成功' });  
      setValidated(false);  
    } catch (error) {  
      console.error('更新滑板车失败:', error);  
      setMessage({ type: 'danger', text: '更新滑板车失败，请稍后重试' });  
    }  
  };  
  
  // 删除滑板车  
  const handleDeleteScooter = async () => {  
    try {  
      await scooterService.deleteScooter(selectedScooter.id);  
      
      const remainingScooters = scooters.filter(scooter => scooter.id !== selectedScooter.id);  
      
      setScooters(remainingScooters);  
      setShowDeleteModal(false);  
      setMessage({ type: 'success', text: '滑板车删除成功' });  
    } catch (error) {  
      console.error('删除滑板车失败:', error);  
      setMessage({ type: 'danger', text: '删除滑板车失败，请稍后重试' });  
    }  
  };  
  
  // 更新滑板车状态  
  const handleStatusChange = async (scooter, newStatus) => {  
    try {  
      const updatedScooter = await scooterService.updateScooter(scooter.id, { status: newStatus });  
      
      const updatedScooters = scooters.map(s => {  
        if (s.id === scooter.id) {  
          return updatedScooter;  
        }  
        return s;  
      });  
      
      setScooters(updatedScooters);  
      setMessage({ type: 'success', text: '滑板车状态更新成功' });  
    } catch (error) {  
      console.error('更新滑板车状态失败:', error);  
      setMessage({ type: 'danger', text: '更新滑板车状态失败，请稍后重试' });  
    }  
  };  
  
  // 分页处理  
  const indexOfLastScooter = currentPage * scootersPerPage;  
  const indexOfFirstScooter = indexOfLastScooter - scootersPerPage;  
  const currentScooters = filteredScooters.slice(indexOfFirstScooter, indexOfLastScooter);  
  const totalPages = Math.ceil(filteredScooters.length / scootersPerPage);  
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);  
  
  // 打开编辑模态框  
  const openEditModal = (scooter) => {  
    console.log('Opening edit modal for scooter:', scooter); // Log scooter object being edited
    setSelectedScooter(scooter);  
    setScooterForm({  
      model: scooter.model,  
      batteryLevel: scooter.batteryLevel,  
      status: scooter.status,
      pricePerHour: scooter.pricePerHour || '',
      pricePerFourHours: scooter.pricePerFourHours || '',
      pricePerDay: scooter.pricePerDay || '',
      pricePerWeek: scooter.pricePerWeek || '',
      location: scooter.location || '',  
      latitude: scooter.latitude || '',  
      longitude: scooter.longitude || '',  
      pricePerFourHours: scooter.pricePerFourHours  
    });  
    setShowEditModal(true);  
  };  
  
  // 打开位置查看模态框  
  const openLocationModal = (scooter) => {  
    setSelectedScooter(scooter);  
    setShowLocationModal(true);  
  };  
  
  // 打开删除模态框  
  const openDeleteModal = (scooter) => {  
    setSelectedScooter(scooter);  
    setShowDeleteModal(true);  
  };  
  
  // 打开价格设置模态框  
  const openPriceModal = (scooter) => {  
    setSelectedScooter(scooter);  
    setScooterForm({  
      ...scooterForm,
      pricePerHour: scooter.pricePerHour || '',
      pricePerFourHours: scooter.pricePerFourHours || '',
      pricePerDay: scooter.pricePerDay || '',
      pricePerWeek: scooter.pricePerWeek || '',
    });  
    setShowPriceModal(true);  
  };  
  
  // 获取电池图标  
  const getBatteryIcon = (level) => {  
    if (level >= 70) return <FaBatteryFull className="text-success" />;  
    if (level >= 30) return <FaBatteryHalf className="text-warning" />;  
    return <FaBatteryEmpty className="text-danger" />;  
  };  
  
  // 获取状态标签  
  const getStatusBadge = (status) => {  
    switch(status) {  
      case 'AVAILABLE':  
        return <Badge bg="success">Available</Badge>;  
      case 'RENTED':  
        return <Badge bg="primary">Rented</Badge>;  
      case 'MAINTENANCE':  
        return <Badge bg="warning">Maintenance</Badge>;  
      case 'OFFLINE':  
        return <Badge bg="danger">Offline</Badge>;  
      default:  
        return <Badge bg="secondary">Unknown</Badge>;  
    }  
  };  
  
  // 切换排序方向  
  const toggleSort = (field) => {  
    if (sortField === field) {  
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');  
    } else {  
      setSortField(field);  
      setSortDirection('asc');  
    }  
  };  
  
  // 清空消息  
  useEffect(() => {  
    if (message.text) {  
      const timer = setTimeout(() => {  
        setMessage({ type: '', text: '' });  
      }, 5000);  
      
      return () => clearTimeout(timer);  
    }  
  }, [message]);  
  
  // 统计各状态滑板车数量  
  const statusCounts = {
    all: scooters?.length || 0,
    available: scooters?.filter(s => s?.status === 'AVAILABLE')?.length || 0,
    rented: scooters?.filter(s => s?.status === 'RENTED')?.length || 0,
    maintenance: scooters?.filter(s => s?.status === 'MAINTENANCE')?.length || 0,
    offline: scooters?.filter(s => s?.status === 'OFFLINE')?.length || 0
  };  
  
  // 获取所有型号列表  
  const uniqueModels = [...new Set(scooters?.map(s => s?.model)?.filter(Boolean) || [])];  
  
  // 处理价格更新
  const handleUpdatePrice = async (e) => {  
    e.preventDefault();  
    const form = e.currentTarget;  
    
    if (form.checkValidity() === false) {  
      e.stopPropagation();  
      setValidated(true);  
      return;  
    }  
    
    try {  
      setValidated(true);
      
      // 确保所有价格字段都是有效的数字
      const priceData = {
        id: selectedScooter.id,
        pricePerHour: parseFloat(scooterForm.pricePerHour) || 0,
        pricePerFourHours: parseFloat(scooterForm.pricePerFourHours) || 0,
        pricePerDay: parseFloat(scooterForm.pricePerDay) || 0,
        pricePerWeek: parseFloat(scooterForm.pricePerWeek) || 0
      };
      
      console.log('Updating scooter price with:', priceData);
      
      // 使用专用的价格更新API端点
      const updatedScooter = await scooterService.updateScooterPrice(priceData);
      
      // 更新状态中的滑板车价格信息
      const updatedScooters = scooters.map(scooter => {  
        if (scooter.id === selectedScooter.id) {  
          return {
            ...scooter,
            pricePerHour: updatedScooter.pricePerHour,
            pricePerFourHours: updatedScooter.pricePerFourHours,
            pricePerDay: updatedScooter.pricePerDay,
            pricePerWeek: updatedScooter.pricePerWeek
          };  
        }  
        return scooter;  
      });  
      
      setScooters(updatedScooters);  
      setShowPriceModal(false);  
      setMessage({ type: 'success', text: '价格更新成功' });  
      setValidated(false);  
    } catch (error) {  
      console.error('更新价格失败:', error);  
      setMessage({ type: 'danger', text: `更新价格失败: ${error.message || '请稍后重试'}` });  
    }  
  };  
  
  return (  
    <Container fluid className="py-4">  
      <Row className="mb-4">  
        <Col>  
          <h2 className="mb-1">Scooter Management</h2>  
          <p className="text-muted">View, add, edit, and delete scooter devices</p>  
        </Col>  
        <Col xs="auto">  
          <Button variant="primary" onClick={() => setShowAddModal(true)}>  
            <FaPlus className="me-2" /> Add Scooter  
          </Button>  
        </Col>  
      </Row>  
      
      {message.text && (  
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>  
          {message.text}  
        </Alert>  
      )}  
      
      <Nav variant="tabs" className="mb-4">  
        <Nav.Item>  
          <Nav.Link   
            active={activeTab === 'all'}   
            onClick={() => setActiveTab('all')}  
          >  
            All ({statusCounts.all})  
          </Nav.Link>  
        </Nav.Item>  
        <Nav.Item>  
          <Nav.Link   
            active={activeTab === 'AVAILABLE'}   
            onClick={() => setActiveTab('AVAILABLE')}  
            className="text-success"  
          >  
            Available ({statusCounts.available})  
          </Nav.Link>  
        </Nav.Item>  
        <Nav.Item>  
          <Nav.Link   
            active={activeTab === 'RENTED'}   
            onClick={() => setActiveTab('RENTED')}  
            className="text-primary"  
          >  
            Rented ({statusCounts.rented})  
          </Nav.Link>  
        </Nav.Item>  
        <Nav.Item>  
          <Nav.Link   
            active={activeTab === 'MAINTENANCE'}   
            onClick={() => setActiveTab('MAINTENANCE')}  
            className="text-warning"  
          >  
            Maintenance ({statusCounts.maintenance})  
          </Nav.Link>  
        </Nav.Item>  
        <Nav.Item>  
          <Nav.Link   
            active={activeTab === 'OFFLINE'}   
            onClick={() => setActiveTab('OFFLINE')}  
            className="text-danger"  
          >  
            Offline ({statusCounts.offline || 0})  
          </Nav.Link>  
        </Nav.Item>  
      </Nav>  
      
      <Card className="border-0 shadow-sm mb-4">  
        <Card.Body>  
          <Row className="mb-3">  
            <Col md={4} xl={3}>  
              <InputGroup>  
                <InputGroup.Text>  
                  <FaSearch />  
                </InputGroup.Text>  
                <Form.Control  
                  placeholder="Search scooter ID or model..."  
                  value={searchTerm}  
                  onChange={(e) => setSearchTerm(e.target.value)}  
                />  
              </InputGroup>  
            </Col>  
            <Col md={8} xl={9}>  
              <div className="d-flex flex-wrap gap-2 justify-content-md-end">  
                <InputGroup>  
                  <InputGroup.Text>Battery</InputGroup.Text>  
                  <Form.Select  
                    value={filterOptions.batteryLevel}  
                    onChange={(e) => setFilterOptions({ ...filterOptions, batteryLevel: e.target.value })}  
                    style={{ width: 'auto' }}  
                  >  
                    <option value="all">All</option>  
                    <option value="high">High (≥80%)</option>  
                    <option value="medium">Medium (30%-80%)</option>  
                    <option value="low">Low (0-30%)</option>  
                  </Form.Select>  
                </InputGroup>  
                
                <InputGroup>  
                  <InputGroup.Text>Model</InputGroup.Text>  
                  <Form.Select  
                    value={filterOptions.model}  
                    onChange={(e) => setFilterOptions({ ...filterOptions, model: e.target.value })}  
                    style={{ width: 'auto' }}  
                  >  
                    <option value="all">All</option>  
                    {uniqueModels.map((model, index) => (  
                      <option key={`model-${model || index}`} value={model}>{model}</option>  
                    ))}  
                  </Form.Select>  
                </InputGroup>  
                
                <Button variant="outline-secondary">  
                  <FaFileExport /> Export  
                </Button>  
              </div>  
            </Col>  
          </Row>  
          
          <div className="table-responsive">  
            <Table hover className="align-middle">  
              <thead>  
                <tr>  
                  <th>#</th>  
                  <th className="sortable" onClick={() => toggleSort('id')}>Scooter ID {sortField === 'id' && (sortDirection === 'asc' ? <FaSortAmountUp className="ms-1" /> : <FaSortAmountDown className="ms-1" />)}</th>  
                  <th className="sortable" onClick={() => toggleSort('model')}>Model {sortField === 'model' && (sortDirection === 'asc' ? <FaSortAmountUp className="ms-1" /> : <FaSortAmountDown className="ms-1" />)}</th>  
                  <th className="sortable" onClick={() => toggleSort('batteryLevel')}>Battery {sortField === 'batteryLevel' && (sortDirection === 'asc' ? <FaSortAmountUp className="ms-1" /> : <FaSortAmountDown className="ms-1" />)}</th>  
                  <th>Status</th>  
                  <th>Location</th>  
                  <th className="sortable" onClick={() => toggleSort('pricePerHour')}>Price {sortField === 'pricePerHour' && (sortDirection === 'asc' ? <FaSortAmountUp className="ms-1" /> : <FaSortAmountDown className="ms-1" />)}</th>  
                  <th className="sortable" onClick={() => toggleSort('rentalCount')}>Rental Count {sortField === 'rentalCount' && (sortDirection === 'asc' ? <FaSortAmountUp className="ms-1" /> : <FaSortAmountDown className="ms-1" />)}</th>  
                  <th className="sortable" onClick={() => toggleSort('totalRevenue')}>Total Revenue {sortField === 'totalRevenue' && (sortDirection === 'asc' ? <FaSortAmountUp className="ms-1" /> : <FaSortAmountDown className="ms-1" />)}</th>  
                  <th>Actions</th>  
                </tr>  
              </thead>  
              <tbody>  
                {isLoading ? (  
                  <tr>  
                    <td colSpan="9" className="text-center py-4">  
                      <div className="spinner-border text-primary" role="status">  
                        <span className="visually-hidden">Loading...</span>  
                      </div>  
                    </td>  
                  </tr>  
                ) : currentScooters.length === 0 ? (  
                  <tr>  
                    <td colSpan="10" className="text-center py-4">  
                      No matching scooters found  
                    </td>  
                  </tr>  
                ) : (  
                  currentScooters.map((scooter, index) => (  
                    <tr key={`scooter-${scooter.id}-${index}`}>  
                      <td>{indexOfFirstScooter + index + 1}</td>  
                      <td>  
                        <div className="d-flex align-items-center">  
                          <div className="scooter-icon me-2">  
                            <FaBicycle />  
                          </div>  
                          {scooter.id}  
                          {scooter.status === 'AVAILABLE' && (  
                            <FaQrcode className="ms-2 text-muted" title="查看二维码" />  
                          )}  
                        </div>  
                      </td>  
                      <td>{scooter.model}</td>  
                      <td>  
                        <div className="d-flex align-items-center">  
                          {getBatteryIcon(scooter.batteryLevel)}  
                          <span className="ms-2">{scooter.batteryLevel}%</span>  
                        </div>  
                      </td>  
                      <td>{getStatusBadge(scooter.status)}</td>  
                      <td>  
                        <Button   
                          variant="link"   
                          className="p-0"   
                          onClick={() => openLocationModal(scooter)}  
                        >  
                          <FaLocationArrow className="text-primary" /> View  
                        </Button>  
                      </td>
                      <td>
                        <Button
                          variant="link"
                          className="p-0 text-decoration-none"
                          onClick={() => openPriceModal(scooter)}
                          title="查看价格详情"
                        >
                          <span className="d-block">¥{scooter.pricePerHour || '-'} /hour</span>
                          <small className="text-muted d-block">Click to view details</small>
                        </Button>
                      </td>
                      <td>{scooter.rentalCount}</td>  
                      <td>¥{scooter.totalRevenue}</td>  
                      <td>  
                        <div className="d-flex gap-2">  
                          <Button   
                            variant="outline-primary"   
                            size="sm"   
                            onClick={() => openEditModal(scooter)}  
                          >  
                            <FaEdit />  
                          </Button>  
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => openPriceModal(scooter)}
                            title="设置价格"
                          >
                            ¥
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDeleteModal(scooter)}
                          >
                            <FaTrash />
                          </Button>
                        </div>  
                      </td>
                    </tr>  
                  ))  
                )}  
              </tbody>  
            </Table>  
          </div>  
          
          {totalPages > 1 && (  
            <div className="d-flex justify-content-between align-items-center mt-4">  
              <div>  
                Showing {indexOfFirstScooter + 1}-{Math.min(indexOfLastScooter, filteredScooters.length)} of {filteredScooters.length} scooters  
              </div>  
              <Pagination>  
                <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />  
                <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />  
                
                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {  
                  let pageNumber;  
                  if (totalPages <= 5) {  
                    pageNumber = index + 1;  
                  } else if (currentPage <= 3) {  
                    pageNumber = index + 1;  
                  } else if (currentPage >= totalPages - 2) {  
                    pageNumber = totalPages - 4 + index;  
                  } else {  
                    pageNumber = currentPage - 2 + index;  
                  }  
                  
                  return (  
                    <Pagination.Item  
                      key={pageNumber}  
                      active={pageNumber === currentPage}  
                      onClick={() => paginate(pageNumber)}  
                    >  
                      {pageNumber}  
                    </Pagination.Item>  
                  );  
                })}  
                
                <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />  
                <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />  
              </Pagination>  
            </div>  
          )}  
        </Card.Body>  
      </Card>  
      
      {/* 添加滑板车模态框 */}  
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>  
        <Modal.Header closeButton>  
          <Modal.Title>Add New Scooter</Modal.Title>  
        </Modal.Header>  
        <Form noValidate validated={validated} onSubmit={handleAddScooter}>  
          <Modal.Body>  
            <Form.Group className="mb-3">  
              <Form.Label>Model</Form.Label>  
              <Form.Select  
                value={scooterForm.model}  
                onChange={(e) => setScooterForm({ ...scooterForm, model: e.target.value })}  
                required  
              >  
                <option value="">Select Model</option>  
                {uniqueModels.map((model, index) => (  
                  <option key={`add-model-${model || index}`} value={model}>{model}</option>  
                ))}  
                <option value="other">Other</option>  
              </Form.Select>  
              <Form.Control.Feedback type="invalid">  
                Please select a model  
              </Form.Control.Feedback>  
            </Form.Group>  
            
            <Form.Group className="mb-3">  
              <Form.Label>Battery ({scooterForm.batteryLevel}%)</Form.Label>  
              <Form.Range  
                value={scooterForm.batteryLevel}  
                onChange={(e) => setScooterForm({ ...scooterForm, batteryLevel: parseInt(e.target.value) })}  
                min="0"  
                max="100"  
              />  
            </Form.Group>  
            
            <Form.Group className="mb-3">  
              <Form.Label>Status</Form.Label>  
              <Form.Select  
                value={scooterForm.status}  
                onChange={(e) => setScooterForm({ ...scooterForm, status: e.target.value })}  
                required  
              >  
                <option value="AVAILABLE">Available</option>  
                <option value="MAINTENANCE">Maintenance</option>  
                <option value="OFFLINE">Offline</option> 
              </Form.Select>  
            </Form.Group>

            <h6 className="mb-3">Price Settings</h6>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price per Hour (¥)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="For example: 15.0"
                    value={scooterForm.pricePerHour}
                    onChange={(e) => setScooterForm({ ...scooterForm, pricePerHour: e.target.value })}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter a valid price
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price per Four Hours (¥)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="For example: 50.0"
                    value={scooterForm.pricePerFourHours}
                    onChange={(e) => setScooterForm({ ...scooterForm, pricePerFourHours: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price per Day (¥)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="For example: 100.0"
                    value={scooterForm.pricePerDay}
                    onChange={(e) => setScooterForm({ ...scooterForm, pricePerDay: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price per Week (¥)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="For example: 500.0"
                    value={scooterForm.pricePerWeek}
                    onChange={(e) => setScooterForm({ ...scooterForm, pricePerWeek: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Location Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="For example: Haidian District, Beijing"
                value={scooterForm.location}
                onChange={(e) => setScooterForm({ ...scooterForm, location: e.target.value })}
                required
              />
            </Form.Group>
            
            <Row>  
              <Col md={6}>  
                <Form.Group className="mb-3">  
                  <Form.Label>Latitude</Form.Label>  
                  <Form.Control  
                    type="text"  
                    placeholder="For example: 39.9042"  
                    value={scooterForm.latitude}  
                    onChange={(e) => setScooterForm({  
                      ...scooterForm,  
                      latitude: e.target.value  
                    })}  
                    required  
                  />  
                  <Form.Control.Feedback type="invalid">  
                    Please enter a valid latitude  
                  </Form.Control.Feedback>  
                </Form.Group>  
              </Col>  
              <Col md={6}>  
                <Form.Group className="mb-3">  
                  <Form.Label>Longitude</Form.Label>  
                  <Form.Control  
                    type="text"  
                    placeholder="For example: 116.4074"  
                    value={scooterForm.longitude}  
                    onChange={(e) => setScooterForm({  
                      ...scooterForm,  
                      longitude: e.target.value  
                    })}  
                    required  
                  />  
                  <Form.Control.Feedback type="invalid">  
                    Please enter a valid longitude  
                  </Form.Control.Feedback>  
                </Form.Group>  
              </Col>  
            </Row>  
            
          </Modal.Body>  
          <Modal.Footer>  
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>  
              Cancel  
            </Button>  
            <Button variant="primary" type="submit">  
              Add  
            </Button>  
          </Modal.Footer>  
        </Form>  
      </Modal>  
      
      {/* 编辑滑板车模态框 */}  
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>  
        <Modal.Header closeButton>  
          <Modal.Title>  
            Edit Scooter {selectedScooter && selectedScooter.id}  
          </Modal.Title>  
        </Modal.Header>  
        <Form noValidate validated={validated} onSubmit={handleEditScooter}>  
          <Modal.Body>  
            <Form.Group className="mb-3">  
              <Form.Label>Model</Form.Label>  
              <Form.Select  
                value={scooterForm.model}  
                onChange={(e) => setScooterForm({ ...scooterForm, model: e.target.value })}  
                required  
              >  
                <option value="">Select Model</option>  
                {uniqueModels.map((model, index) => (  
                  <option key={`edit-model-${model || index}`} value={model}>{model}</option>  
                ))}  
                <option value="other">Other</option>  
              </Form.Select>  
              <Form.Control.Feedback type="invalid">  
                Please select a model  
              </Form.Control.Feedback>  
            </Form.Group>  
            
            <Form.Group className="mb-3">  
              <Form.Label>Battery ({scooterForm.batteryLevel}%)</Form.Label>  
              <Form.Range  
                value={scooterForm.batteryLevel}  
                onChange={(e) => setScooterForm({ ...scooterForm, batteryLevel: parseInt(e.target.value) })}  
                min="0"  
                max="100"  
              />  
            </Form.Group>  
            
            <Form.Group className="mb-3">  
              <Form.Label>Status</Form.Label>  
              <Form.Select  
                value={scooterForm.status}  
                onChange={(e) => setScooterForm({ ...scooterForm, status: e.target.value })}  
                required  
              >  
                <option value="AVAILABLE">Available</option>  
                <option value="MAINTENANCE">Maintenance</option>  
                <option value="OFFLINE">Offline</option> 
              </Form.Select>  
            </Form.Group>  

            <Form.Group className="mb-3">
              <Form.Label>Location Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="For example: Haidian District, Beijing"
                value={scooterForm.location}
                onChange={(e) => setScooterForm({ ...scooterForm, location: e.target.value })}
                required
              />
            </Form.Group>
            
            <Row>  
              <Col md={6}>  
                <Form.Group className="mb-3">  
                  <Form.Label>Latitude</Form.Label>  
                  <Form.Control  
                    type="text"  
                    placeholder="For example: 39.9042"  
                    value={scooterForm.latitude}  
                    onChange={(e) => setScooterForm({  
                      ...scooterForm,  
                      latitude: e.target.value  
                    })}  
                    required  
                  />  
                  <Form.Control.Feedback type="invalid">  
                    Please enter a valid latitude  
                  </Form.Control.Feedback>  
                </Form.Group>  
              </Col>  
              <Col md={6}>  
                <Form.Group className="mb-3">  
                  <Form.Label>Longitude</Form.Label>  
                  <Form.Control  
                    type="text"  
                    placeholder="For example: 116.4074"  
                    value={scooterForm.longitude}  
                    onChange={(e) => setScooterForm({  
                      ...scooterForm,  
                      longitude: e.target.value  
                    })}  
                    required  
                  />  
                  <Form.Control.Feedback type="invalid">  
                    Please enter a valid longitude  
                  </Form.Control.Feedback>  
                </Form.Group>  
              </Col>  
            </Row>  
            
          </Modal.Body>  
          <Modal.Footer>  
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>  
              Cancel  
            </Button>  
            <Button variant="primary" type="submit">  
              Save  
            </Button>  
          </Modal.Footer>  
        </Form>  
      </Modal>  
      
      {/* 删除滑板车确认模态框 */}  
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>  
        <Modal.Header closeButton>  
          <Modal.Title>Confirm Delete</Modal.Title>  
        </Modal.Header>  
        <Modal.Body>  
          <div className="text-center mb-4">  
            <FaExclamationTriangle size={48} className="text-warning mb-3" />  
            <h5>Are you sure you want to delete this scooter?</h5>  
            <p className="text-muted">  
              {selectedScooter && `Scooter ID: ${selectedScooter.id}`}<br />  
              {selectedScooter && `Model: ${selectedScooter.model}`}  
            </p>  
            <p className="text-danger">  
              This operation cannot be undone. All data related to this scooter will be permanently deleted.  
            </p>  
          </div>  
        </Modal.Body>  
        <Modal.Footer>  
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>  
            Cancel  
          </Button>  
          <Button variant="danger" onClick={handleDeleteScooter}>  
            Confirm Delete  
          </Button>  
        </Modal.Footer>  
      </Modal>  
      
      {/* 位置查看模态框 */}  
      <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)} centered>  
        <Modal.Header closeButton>  
          <Modal.Title>Scooter Location</Modal.Title>  
        </Modal.Header>  
        <Modal.Body>  
          {selectedScooter && (  
            <div>  
              <p className="mb-4">  
                <strong>Scooter ID:</strong> {selectedScooter.id}<br />  
                <strong>Current Location:</strong> Latitude {selectedScooter.latitude}, Longitude {selectedScooter.longitude}  
              </p>  
              
              <div className="map-placeholder bg-light rounded text-center p-5 mb-3">  
                <FaLocationArrow size={32} className="text-primary mb-3" />  
                <h6>Loading Map...</h6>  
                <p className="text-muted small">This will display the scooter's location on the map</p>  
              </div>  
              
              <div className="d-flex justify-content-between text-muted small">  
                <span>Last Updated: Today 10:25</span>  
                <Button variant="link" size="sm" className="p-0">  
                  Refresh Location  
                </Button>  
              </div>  
            </div>  
          )}  
        </Modal.Body>  
        <Modal.Footer>  
          <Button variant="outline-primary">  
            Navigate to This Location  
          </Button>  
          <Button variant="secondary" onClick={() => setShowLocationModal(false)}>  
            Close  
          </Button>  
        </Modal.Footer>  
      </Modal>
      
      {/* 价格设置模态框 */}
      <Modal show={showPriceModal} onHide={() => setShowPriceModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Set Scooter Price</Modal.Title>
        </Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleUpdatePrice}>
          <Modal.Body>
            {selectedScooter && (
              <>
                <p className="mb-3">
                  <strong>Scooter ID:</strong> {selectedScooter.id}<br />
                  <strong>Model:</strong> {selectedScooter.model}
                </p>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price per Hour (¥)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="For example: 5.00"
                        value={scooterForm.pricePerHour}
                        onChange={(e) => setScooterForm({ ...scooterForm, pricePerHour: e.target.value })}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid hourly price
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price per Four Hours (¥)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="For example: 18.00"
                        value={scooterForm.pricePerFourHours}
                        onChange={(e) => setScooterForm({ ...scooterForm, pricePerFourHours: e.target.value })}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid 4-hour price
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price per Day (¥)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="For example: 25.00"
                        value={scooterForm.pricePerDay}
                        onChange={(e) => setScooterForm({ ...scooterForm, pricePerDay: e.target.value })}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid daily price
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price per Week (¥)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="For example: 150.00"
                        value={scooterForm.pricePerWeek}
                        onChange={(e) => setScooterForm({ ...scooterForm, pricePerWeek: e.target.value })}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid weekly price
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="bg-light p-3 rounded mt-2">
                  <h6 className="mb-2">Price Suggestions</h6>
                  <p className="small text-muted mb-0">
                    • 4-hour price is usually 3.5-4 times the hourly price<br />
                    • Daily price is usually 5-6 times the hourly price<br />
                    • Weekly price is usually 6-7 times the daily price
                  </p>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPriceModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Price
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>  
  );
};

export default ScooterManagement;