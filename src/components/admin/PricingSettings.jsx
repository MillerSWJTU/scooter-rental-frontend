import React, { useState, useEffect } from 'react';  
import {   
  Container, Row, Col, Card, Form, Button, Table,   
  Tabs, Tab, Modal, Alert, InputGroup, Badge,  
  OverlayTrigger, Tooltip  
} from 'react-bootstrap';  
import {   
  FaSave, FaUndo, FaPlus, FaTrash, FaInfoCircle,
  FaHistory, FaPercentage, FaClock, FaMapMarkedAlt,
  FaUserTag, FaCalendarAlt, FaExclamationTriangle
} from 'react-icons/fa';  

const PricingSettings = () => {  
  // 状态管理  
  const [pricingConfig, setPricingConfig] = useState({  
    baseRate: {  
      unlockFee: 2.00,  
      perMinuteRate: 0.30,  
      minimumFare: 5.00,  
      maximumDailyFare: 50.00,  
      reservationFee: 1.00,  
      cancellationFee: 2.00,  
      parkingFineOutsideZone: 5.00  
    },  
    timeBasedRates: [  
      { id: 1, name: 'Standard Time Period', startTime: '10:00', endTime: '16:00', multiplier: 1.0, active: true },  
      { id: 2, name: 'Morning Peak', startTime: '07:00', endTime: '10:00', multiplier: 1.25, active: true },  
      { id: 3, name: 'Evening Peak', startTime: '16:00', endTime: '20:00', multiplier: 1.5, active: true },  
      { id: 4, name: 'Night', startTime: '20:00', endTime: '07:00', multiplier: 0.8, active: true }  
    ],  
    membershipPlans: [  
      { id: 1, name: 'Monthly Membership', price: 39.99, discountPercentage: 20, freeUnlocks: 10, description: 'Monthly discount rides, including 10 free unlocks', active: true },  
      { id: 2, name: 'Annual Membership', price: 299.99, discountPercentage: 30, freeUnlocks: 200, description: 'Unlimited rides annually, including 200 free unlocks', active: true },  
      { id: 3, name: 'Student Plan', price: 19.99, discountPercentage: 25, freeUnlocks: 5, description: 'Student exclusive monthly discount', active: true }  
    ],  
    promotions: [  
      { id: 1, name: 'First Ride', code: 'FIRST', discountType: 'percentage', discountValue: 100, maxDiscount: 10, startDate: '2023-01-01', endDate: '2023-12-31', active: true },  
      { id: 2, name: 'Weekend Special', code: 'WEEKEND', discountType: 'percentage', discountValue: 20, maxDiscount: null, startDate: '2023-01-01', endDate: '2023-12-31', active: true },  
      { id: 3, name: 'Refer a Friend', code: 'REFER', discountType: 'fixed', discountValue: 10, maxDiscount: null, startDate: '2023-01-01', endDate: '2023-12-31', active: true }  
    ],  
    specialEvents: [  
      { id: 1, name: 'Holiday Special', startDate: '2023-11-11', endDate: '2023-11-12', multiplier: 0.7, description: '70% off on Singles Day rides', active: true },  
      { id: 2, name: 'Chinese New Year', startDate: '2023-01-21', endDate: '2023-01-27', multiplier: 0.5, description: '50% off during Chinese New Year', active: true }  
    ],  
    zonePricing: [  
      { id: 1, name: 'City Center', multiplier: 1.2, color: '#FF5733', active: true },  
      { id: 2, name: 'Commercial Area', multiplier: 1.1, color: '#33FF57', active: true },  
      { id: 3, name: 'Suburban', multiplier: 0.9, color: '#3357FF', active: true },  
      { id: 4, name: 'School Area', multiplier: 0.8, color: '#F3FF33', active: true }  
    ]  
  });  
  
  const [activeTab, setActiveTab] = useState('baseRate');  
  const [showHistoryModal, setShowHistoryModal] = useState(false);  
  const [showDeleteModal, setShowDeleteModal] = useState(false);  
  const [itemToDelete, setItemToDelete] = useState(null);  
  const [message, setMessage] = useState({ show: false, type: '', content: '' });  
  const [newItem, setNewItem] = useState(null);  
  const [showNewItemModal, setShowNewItemModal] = useState(false);  
  const [isDirty, setIsDirty] = useState(false);  
  const [confirmedExit, setConfirmedExit] = useState(false);  
  const [showExitModal, setShowExitModal] = useState(false);  
  const [originalConfig, setOriginalConfig] = useState(null);  
  const [priceChangeSummary, setPriceChangeSummary] = useState([]);  
  
  // 模拟价格变更历史记录  
  const pricingHistory = [  
    { id: 1, date: '2023-10-15', user: 'admin', changes: 'Modified base rate: unlock fee changed from 1.5 to 2', type: 'baseRate' },  
    { id: 2, date: '2023-09-01', user: 'manager', changes: 'Added new membership plan: student plan', type: 'membershipPlans' },  
    { id: 3, date: '2023-08-15', user: 'admin', changes: 'Modified peak time multiplier: 1.3 to 1.5', type: 'timeBasedRates' },  
    { id: 4, date: '2023-07-20', user: 'manager', changes: 'Added new promotion: first ride free', type: 'promotions' },  
    { id: 5, date: '2023-06-10', user: 'admin', changes: 'Added new zone pricing: city center 1.2x', type: 'zonePricing' }  
  ];  
  
  // 保存原始配置用于恢复和比较  
  useEffect(() => {  
    if (!originalConfig) {  
      setOriginalConfig(JSON.parse(JSON.stringify(pricingConfig)));  
    }  
  }, [pricingConfig, originalConfig]);  
  
  // 检测配置更改并更新isDirty状态  
  useEffect(() => {  
    if (originalConfig) {  
      const hasChanges = JSON.stringify(pricingConfig) !== JSON.stringify(originalConfig);  
      setIsDirty(hasChanges);  
      
      if (hasChanges) {  
        generateChangeSummary();  
      } else {  
        setPriceChangeSummary([]);  
      }  
    }  
  }, [pricingConfig, originalConfig]);  
  
  // 生成价格变更摘要  
  const generateChangeSummary = () => {  
    const summary = [];  
    
    // 基础费率变更  
    Object.keys(pricingConfig.baseRate).forEach(key => {  
      if (pricingConfig.baseRate[key] !== originalConfig.baseRate[key]) {  
        const fieldNameMap = {  
          unlockFee: 'Unlock Fee',  
          perMinuteRate: 'Per Minute Rate',  
          minimumFare: 'Minimum Fare',  
          maximumDailyFare: 'Maximum Daily Fare',  
          reservationFee: 'Reservation Fee',  
          cancellationFee: 'Cancellation Fee',  
          parkingFineOutsideZone: 'Parking Fine Outside Zone'  
        };  
        
        summary.push({  
          category: 'Base Rate',  
          field: fieldNameMap[key] || key,  
          from: originalConfig.baseRate[key],  
          to: pricingConfig.baseRate[key]  
        });  
      }  
    });  
    
    // 可以添加其他类别的变更检测...  
    
    setPriceChangeSummary(summary);  
  };  
  
  // 处理基础费率变更  
  const handleBaseRateChange = (field, value) => {  
    setPricingConfig({  
      ...pricingConfig,  
      baseRate: {  
        ...pricingConfig.baseRate,  
        [field]: parseFloat(value)  
      }  
    });  
  };  
  
  // 处理时段费率变更  
  const handleTimeBasedRateChange = (id, field, value) => {  
    setPricingConfig({  
      ...pricingConfig,  
      timeBasedRates: pricingConfig.timeBasedRates.map(rate => {  
        if (rate.id === id) {  
          if (field === 'multiplier') {  
            value = parseFloat(value);  
          }  
          if (field === 'active') {  
            value = !rate.active;  
          }  
          return { ...rate, [field]: value };  
        }  
        return rate;  
      })  
    });  
  };  
  
  // 处理会员套餐变更  
  const handleMembershipPlanChange = (id, field, value) => {  
    setPricingConfig({  
      ...pricingConfig,  
      membershipPlans: pricingConfig.membershipPlans.map(plan => {  
        if (plan.id === id) {  
          if (['price', 'discountPercentage', 'freeUnlocks'].includes(field)) {  
            value = parseFloat(value);  
          }  
          if (field === 'active') {  
            value = !plan.active;  
          }  
          return { ...plan, [field]: value };  
        }  
        return plan;  
      })  
    });  
  };  
  
  // 处理促销变更  
  const handlePromotionChange = (id, field, value) => {  
    setPricingConfig({  
      ...pricingConfig,  
      promotions: pricingConfig.promotions.map(promo => {  
        if (promo.id === id) {  
          if (['discountValue', 'maxDiscount'].includes(field) && value !== null) {  
            value = parseFloat(value);  
          }  
          if (field === 'active') {  
            value = !promo.active;  
          }  
          return { ...promo, [field]: value };  
        }  
        return promo;  
      })  
    });  
  };  
  
  // 处理特殊事件变更  
  const handleSpecialEventChange = (id, field, value) => {  
    setPricingConfig({  
      ...pricingConfig,  
      specialEvents: pricingConfig.specialEvents.map(event => {  
        if (event.id === id) {  
          if (field === 'multiplier') {  
            value = parseFloat(value);  
          }  
          if (field === 'active') {  
            value = !event.active;  
          }  
          return { ...event, [field]: value };  
        }  
        return event;  
      })  
    });  
  };  
  
  // 处理区域定价变更  
  const handleZonePricingChange = (id, field, value) => {  
    setPricingConfig({  
      ...pricingConfig,  
      zonePricing: pricingConfig.zonePricing.map(zone => {  
        if (zone.id === id) {  
          if (field === 'multiplier') {  
            value = parseFloat(value);  
          }  
          if (field === 'active') {  
            value = !zone.active;  
          }  
          return { ...zone, [field]: value };  
        }  
        return zone;  
      })  
    });  
  };  
  
  // 处理删除项目  
  const handleDeleteItem = () => {  
    if (!itemToDelete) return;  
    
    const { category, id } = itemToDelete;  
    let updatedConfig = { ...pricingConfig };  
    
    switch (category) {  
      case 'timeBasedRates':  
        updatedConfig.timeBasedRates = updatedConfig.timeBasedRates.filter(item => item.id !== id);  
        break;  
      case 'membershipPlans':  
        updatedConfig.membershipPlans = updatedConfig.membershipPlans.filter(item => item.id !== id);  
        break;  
      case 'promotions':  
        updatedConfig.promotions = updatedConfig.promotions.filter(item => item.id !== id);  
        break;  
      case 'specialEvents':  
        updatedConfig.specialEvents = updatedConfig.specialEvents.filter(item => item.id !== id);  
        break;  
      case 'zonePricing':  
        updatedConfig.zonePricing = updatedConfig.zonePricing.filter(item => item.id !== id);  
        break;  
      default:  
        break;  
    }  
    
    setPricingConfig(updatedConfig);  
    setShowDeleteModal(false);  
    setItemToDelete(null);  
    setMessage({ show: true, type: 'success', content: 'Item has been successfully deleted' });  
  };  
  
  // 添加新项目  
  const handleAddNewItem = () => {  
    if (!newItem) return;  
    
    const { category, ...itemData } = newItem;  
    let updatedConfig = { ...pricingConfig };  
    const maxId = Math.max(...updatedConfig[category].map(item => item.id), 0);  
    
    const newItemWithId = {  
      ...itemData,  
      id: maxId + 1,  
      active: true  
    };  
    
    updatedConfig[category] = [...updatedConfig[category], newItemWithId];  
    
    setPricingConfig(updatedConfig);  
    setShowNewItemModal(false);  
    setNewItem(null);  
    setMessage({ show: true, type: 'success', content: 'New item has been successfully added' });  
  };  
  
  // 准备添加新项目  
  const prepareNewItem = (category) => {  
    let template = {};  
    
    switch (category) {  
      case 'timeBasedRates':  
        template = { name: '', startTime: '00:00', endTime: '23:59', multiplier: 1.0 };  
        break;  
      case 'membershipPlans':  
        template = { name: '', price: 0, discountPercentage: 0, freeUnlocks: 0, description: '' };  
        break;  
      case 'promotions':  
        template = {   
          name: '',   
          code: '',   
          discountType: 'percentage',   
          discountValue: 0,   
          maxDiscount: null,   
          startDate: new Date().toISOString().split('T')[0],   
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]   
        };  
        break;  
      case 'specialEvents':  
        template = {   
          name: '',   
          startDate: new Date().toISOString().split('T')[0],   
          endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],   
          multiplier: 1.0,   
          description: ''   
        };  
        break;  
      case 'zonePricing':  
        template = { name: '', multiplier: 1.0, color: '#' + Math.floor(Math.random()*16777215).toString(16) };  
        break;  
      default:  
        break;  
    }  
    
    setNewItem({ category, ...template });  
    setShowNewItemModal(true);  
  };  
  
  // 保存所有更改  
  const handleSave = () => {  
    // 这里应该调用API保存配置  
    setMessage({ show: true, type: 'success', content: 'Price settings have been successfully saved' });  
    setOriginalConfig(JSON.parse(JSON.stringify(pricingConfig)));  
    setIsDirty(false);  
  };  
  
  // 重置所有更改  
  const handleReset = () => {  
    if (originalConfig) {  
      setPricingConfig(JSON.parse(JSON.stringify(originalConfig)));  
      setMessage({ show: true, type: 'info', content: 'Reset to last saved settings' });  
    }  
  };  
  
  // 格式化货币显示  
  const formatCurrency = (value) => {  
    return `¥${value.toFixed(2)}`;  
  };  
  
  // 处理导航到其他页面前的确认  
  const handleTabChange = (key) => {  
    if (isDirty && !confirmedExit) {  
      setShowExitModal(true);  
      return;  
    }  
    
    setActiveTab(key);  
  };  
  
  // 确认离开  
  const confirmExit = () => {  
    setConfirmedExit(true);  
    setShowExitModal(false);  
    // 此处实际应用中可能需要导航到其他页面  
  };  
  
  // 基础费率表单  
  const BaseRateForm = () => (  
    <Form>  
      <Row>  
        <Col md={6} lg={4}>  
          <Form.Group className="mb-4">  
            <Form.Label className="d-flex justify-content-between">  
              Unlock Fee  
              <OverlayTrigger  
                placement="top"  
                overlay={<Tooltip>一次性费用，用户开始使用滑板车时</Tooltip>}  
              >  
                <FaInfoCircle className="text-muted" />  
              </OverlayTrigger>  
            </Form.Label>  
            <InputGroup>  
              <InputGroup.Text>¥</InputGroup.Text>  
              <Form.Control  
                type="number"  
                min="0"  
                step="0.01"  
                value={pricingConfig.baseRate.unlockFee}  
                onChange={(e) => handleBaseRateChange('unlockFee', e.target.value)}  
              />  
            </InputGroup>  
          </Form.Group>  
        </Col>  
        
        <Col md={6} lg={4}>  
          <Form.Group className="mb-4">  
            <Form.Label className="d-flex justify-content-between">  
              Per Minute Rate  
              <OverlayTrigger  
                placement="top"  
                overlay={<Tooltip>骑行期间每分钟收取的费用</Tooltip>}  
              >  
                <FaInfoCircle className="text-muted" />  
              </OverlayTrigger>  
            </Form.Label>  
            <InputGroup>  
              <InputGroup.Text>¥</InputGroup.Text>  
              <Form.Control  
                type="number"  
                min="0"  
                step="0.01"  
                value={pricingConfig.baseRate.perMinuteRate}  
                onChange={(e) => handleBaseRateChange('perMinuteRate', e.target.value)}  
              />  
            </InputGroup>  
          </Form.Group>  
        </Col>  
        
        <Col md={6} lg={4}>  
          <Form.Group className="mb-4">  
            <Form.Label className="d-flex justify-content-between">  
              Minimum Fare  
              <OverlayTrigger  
                placement="top"  
                overlay={<Tooltip>每次骑行的最低收费金额</Tooltip>}  
              >  
                <FaInfoCircle className="text-muted" />  
              </OverlayTrigger>  
            </Form.Label>  
            <InputGroup>  
              <InputGroup.Text>¥</InputGroup.Text>  
              <Form.Control  
                type="number"  
                min="0"  
                step="0.01"  
                value={pricingConfig.baseRate.minimumFare}  
                onChange={(e) => handleBaseRateChange('minimumFare', e.target.value)}  
              />  
            </InputGroup>  
          </Form.Group>  
        </Col>  
        
        <Col md={6} lg={4}>  
          <Form.Group className="mb-4">  
            <Form.Label className="d-flex justify-content-between">  
              Maximum Daily Fare  
              <OverlayTrigger  
                placement="top"  
                overlay={<Tooltip>每天收费的上限金额</Tooltip>}  
              >  
                <FaInfoCircle className="text-muted" />  
              </OverlayTrigger>  
            </Form.Label>  
            <InputGroup>  
              <InputGroup.Text>¥</InputGroup.Text>  
              <Form.Control  
                type="number"  
                min="0"  
                step="0.01"  
                value={pricingConfig.baseRate.maximumDailyFare}  
                onChange={(e) => handleBaseRateChange('maximumDailyFare', e.target.value)}  
              />  
            </InputGroup>  
          </Form.Group>  
        </Col>  
        
        <Col md={6} lg={4}>  
          <Form.Group className="mb-4">  
            <Form.Label className="d-flex justify-content-between">  
              Reservation Fee  
              <OverlayTrigger  
                placement="top"  
                overlay={<Tooltip>预订滑板车的费用</Tooltip>}  
              >  
                <FaInfoCircle className="text-muted" />  
              </OverlayTrigger>  
            </Form.Label>  
            <InputGroup>  
              <InputGroup.Text>¥</InputGroup.Text>  
              <Form.Control  
                type="number"  
                min="0"  
                step="0.01"  
                value={pricingConfig.baseRate.reservationFee}  
                onChange={(e) => handleBaseRateChange('reservationFee', e.target.value)}  
              />  
            </InputGroup>  
          </Form.Group>  
        </Col>  
        
        <Col md={6} lg={4}>  
          <Form.Group className="mb-4">  
            <Form.Label className="d-flex justify-content-between">  
              Cancellation Fee  
              <OverlayTrigger  
                placement="top"  
                overlay={<Tooltip>取消预订的费用</Tooltip>}  
              >  
                <FaInfoCircle className="text-muted" />  
              </OverlayTrigger>  
            </Form.Label>  
            <InputGroup>  
              <InputGroup.Text>¥</InputGroup.Text>  
              <Form.Control  
                type="number"  
                min="0"  
                step="0.01"  
                value={pricingConfig.baseRate.cancellationFee}  
                onChange={(e) => handleBaseRateChange('cancellationFee', e.target.value)}  
              />  
            </InputGroup>  
          </Form.Group>  
        </Col>  
        
        <Col md={6} lg={4}>  
          <Form.Group className="mb-4">  
            <Form.Label className="d-flex justify-content-between">  
              Parking Fine Outside Zone  
              <OverlayTrigger  
                placement="top"  
                overlay={<Tooltip>在非指定区域停放滑板车的罚款</Tooltip>}  
              >  
                <FaInfoCircle className="text-muted" />  
              </OverlayTrigger>  
            </Form.Label>  
            <InputGroup>  
              <InputGroup.Text>¥</InputGroup.Text>  
              <Form.Control  
                type="number"  
                min="0"  
                step="0.01"  
                value={pricingConfig.baseRate.parkingFineOutsideZone}  
                onChange={(e) => handleBaseRateChange('parkingFineOutsideZone', e.target.value)}  
              />  
            </InputGroup>  
          </Form.Group>  
        </Col>  
      </Row>  
      
      <hr className="my-4" />  
      
      <div className="pricing-preview p-3 bg-light rounded mb-4">  
        <h5>Price Preview</h5>  
        <p className="mb-1">Below is an example of pricing based on current settings:</p>  
        <Table size="sm" className="bg-white">  
          <thead>  
            <tr>  
              <th>Ride Duration</th>  
              <th>Total Price</th>  
              <th>Calculation Details</th>  
            </tr>  
          </thead>  
          <tbody>  
            <tr>  
              <td>5 minutes</td>  
              <td>{formatCurrency(Math.max(pricingConfig.baseRate.unlockFee + 5 * pricingConfig.baseRate.perMinuteRate, pricingConfig.baseRate.minimumFare))}</td>  
              <td>Unlock Fee {formatCurrency(pricingConfig.baseRate.unlockFee)} + 5 minutes × {formatCurrency(pricingConfig.baseRate.perMinuteRate)}/minute</td>  
            </tr>  
            <tr>  
              <td>15 minutes</td>  
              <td>{formatCurrency(Math.max(pricingConfig.baseRate.unlockFee + 15 * pricingConfig.baseRate.perMinuteRate, pricingConfig.baseRate.minimumFare))}</td>  
              <td>Unlock Fee {formatCurrency(pricingConfig.baseRate.unlockFee)} + 15 minutes × {formatCurrency(pricingConfig.baseRate.perMinuteRate)}/minute</td>  
            </tr>  
            <tr>  
              <td>30 minutes</td>  
              <td>{formatCurrency(Math.max(pricingConfig.baseRate.unlockFee + 30 * pricingConfig.baseRate.perMinuteRate, pricingConfig.baseRate.minimumFare))}</td>  
              <td>Unlock Fee {formatCurrency(pricingConfig.baseRate.unlockFee)} + 30 minutes × {formatCurrency(pricingConfig.baseRate.perMinuteRate)}/minute</td>  
            </tr>  
          </tbody>  
        </Table>  
      </div>  
    </Form>  
  );  
  
  // 时段定价表格  
  const TimeBasedRatesTable = () => (  
    <div>  
      <div className="d-flex justify-content-between mb-3">  
        <h5>Time-Based Rates Settings</h5>  
        <Button variant="outline-primary" size="sm" onClick={() => prepareNewItem('timeBasedRates')}>  
          <FaPlus className="me-1" /> Add Time Period  
        </Button>  
      </div>  
      
      <Table responsive hover>  
        <thead>  
          <tr>  
            <th>Time Period Name</th>  
            <th>Start Time</th>  
            <th>End Time</th>  
            <th>Multiplier</th>  
            <th>Status</th>  
            <th>Actions</th>  
          </tr>  
        </thead>  
        <tbody>  
          {pricingConfig.timeBasedRates.map(rate => (  
            <tr key={rate.id} className={!rate.active ? 'text-muted' : ''}>  
              <td>  
                <Form.Control  
                  type="text"  
                  value={rate.name}  
                  onChange={(e) => handleTimeBasedRateChange(rate.id, 'name', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <Form.Control  
                  type="time"  
                  value={rate.startTime}  
                  onChange={(e) => handleTimeBasedRateChange(rate.id, 'startTime', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <Form.Control  
                  type="time"  
                  value={rate.endTime}  
                  onChange={(e) => handleTimeBasedRateChange(rate.id, 'endTime', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <InputGroup size="sm">  
                  <Form.Control  
                    type="number"  
                    value={rate.multiplier}  
                    onChange={(e) => handleTimeBasedRateChange(rate.id, 'multiplier', e.target.value)}  
                    min="0"  
                    step="0.05"  
                  />  
                  <InputGroup.Text>×</InputGroup.Text>  
                </InputGroup>  
              </td>  
              <td>  
                <Form.Check  
                  type="switch"  
                  id={`time-status-${rate.id}`}  
                  checked={rate.active}  
                  onChange={() => handleTimeBasedRateChange(rate.id, 'active')}  
                  label={rate.active ? 'Enabled' : 'Disabled'}  
                />  
              </td>  
              <td>  
                <Button  
                  variant="outline-danger"  
                  size="sm"  
                  onClick={() => {  
                    setItemToDelete({ category: 'timeBasedRates', id: rate.id, name: rate.name });  
                    setShowDeleteModal(true);  
                  }}  
                >  
                  <FaTrash />  
                </Button>  
              </td>  
            </tr>  
          ))}  
        </tbody>  
      </Table>  
      
      <div className="pricing-preview p-3 bg-light rounded my-4">  
        <h5>Time-Based Rates Example</h5>  
        <p className="mb-3">15 minutes ride price in different time periods:</p>  
        <Row>  
          {pricingConfig.timeBasedRates.filter(rate => rate.active).map(rate => {  
            const basePrice = Math.max(  
              pricingConfig.baseRate.unlockFee + 15 * pricingConfig.baseRate.perMinuteRate,  
              pricingConfig.baseRate.minimumFare  
            );  
            const adjustedPrice = basePrice * rate.multiplier;  
            
            return (  
              <Col key={rate.id} md={6} lg={3} className="mb-3">  
                <Card>  
                  <Card.Body className="p-3">  
                    <h6>{rate.name} ({rate.startTime}-{rate.endTime})</h6>  
                    <div className="fs-5 fw-bold mb-1">{formatCurrency(adjustedPrice)}</div>  
                    <small className="text-muted">  
                      Base price {formatCurrency(basePrice)} × {rate.multiplier}  
                    </small>  
                  </Card.Body>  
                </Card>  
              </Col>  
            );  
          })}  
        </Row>  
      </div>  
    </div>  
  );  
  
  // 会员套餐表格  
  const MembershipPlansTable = () => (  
    <div>  
      <div className="d-flex justify-content-between mb-3">  
        <h5>Membership Plans Settings</h5>  
        <Button variant="outline-primary" size="sm" onClick={() => prepareNewItem('membershipPlans')}>  
          <FaPlus className="me-1" /> Add Plan  
        </Button>  
      </div>  
      
      <Table responsive hover>  
        <thead>  
          <tr>  
            <th>Plan Name</th>  
            <th>Price</th>  
            <th>Discount Percentage</th>  
            <th>Free Unlocks</th>  
            <th>Description</th>  
            <th>Status</th>  
            <th>Actions</th>  
          </tr>  
        </thead>  
        <tbody>  
          {pricingConfig.membershipPlans.map(plan => (  
            <tr key={plan.id} className={!plan.active ? 'text-muted' : ''}>  
              <td>  
                <Form.Control  
                  type="text"  
                  value={plan.name}  
                  onChange={(e) => handleMembershipPlanChange(plan.id, 'name', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <InputGroup size="sm">  
                  <InputGroup.Text>¥</InputGroup.Text>  
                  <Form.Control  
                    type="number"  
                    value={plan.price}  
                    onChange={(e) => handleMembershipPlanChange(plan.id, 'price', e.target.value)}  
                    min="0"  
                    step="0.01"  
                  />  
                </InputGroup>  
              </td>  
              <td>  
                <InputGroup size="sm">  
                  <Form.Control  
                    type="number"  
                    value={plan.discountPercentage}  
                    onChange={(e) => handleMembershipPlanChange(plan.id, 'discountPercentage', e.target.value)}  
                    min="0"  
                    max="100"  
                  />  
                  <InputGroup.Text>%</InputGroup.Text>  
                </InputGroup>  
              </td>  
              <td>  
                <Form.Control  
                  type="number"  
                  value={plan.freeUnlocks}  
                  onChange={(e) => handleMembershipPlanChange(plan.id, 'freeUnlocks', e.target.value)}  
                  min="0"  
                  size="sm"  
                />  
              </td>  
              <td>  
                <Form.Control  
                  type="text"  
                  value={plan.description}  
                  onChange={(e) => handleMembershipPlanChange(plan.id, 'description', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <Form.Check  
                  type="switch"  
                  id={`member-status-${plan.id}`}  
                  checked={plan.active}  
                  onChange={() => handleMembershipPlanChange(plan.id, 'active')}  
                  label={plan.active ? 'Enabled' : 'Disabled'}  
                />  
              </td>  
              <td>  
                <Button  
                  variant="outline-danger"  
                  size="sm"  
                  onClick={() => {  
                    setItemToDelete({ category: 'membershipPlans', id: plan.id, name: plan.name });  
                    setShowDeleteModal(true);  
                  }}  
                >  
                  <FaTrash />  
                </Button>  
              </td>  
            </tr>  
          ))}  
        </tbody>  
      </Table>  
      
      <div className="pricing-preview p-3 bg-light rounded my-4">  
        <h5>Membership Plans Value Example</h5>  
        <p className="mb-3">Comparison of costs for 15 minutes ride 10 times:</p>  
        <Row>  
          <Col md={6} lg={3} className="mb-3">  
            <Card>  
              <Card.Body className="p-3">  
                <h6>Non-Member Price</h6>  
                <div className="fs-5 fw-bold mb-1">  
                  {formatCurrency(10 * Math.max(  
                    pricingConfig.baseRate.unlockFee + 15 * pricingConfig.baseRate.perMinuteRate,  
                    pricingConfig.baseRate.minimumFare  
                  ))}  
                </div>  
                <small className="text-muted">  
                  {formatCurrency(Math.max(  
                    pricingConfig.baseRate.unlockFee + 15 * pricingConfig.baseRate.perMinuteRate,  
                    pricingConfig.baseRate.minimumFare  
                  ))} × 10 times  
                </small>  
              </Card.Body>  
            </Card>  
          </Col>  
          
          {pricingConfig.membershipPlans.filter(plan => plan.active).map(plan => {  
            const basePrice = Math.max(  
              pricingConfig.baseRate.unlockFee + 15 * pricingConfig.baseRate.perMinuteRate,  
              pricingConfig.baseRate.minimumFare  
            );  
            
            const freeUnlocksUsed = Math.min(plan.freeUnlocks, 10);  
            const paidRides = 10 - freeUnlocksUsed;  
            
            const discountedBasePrice = basePrice * (1 - plan.discountPercentage / 100);  
            const totalCost = plan.price + paidRides * discountedBasePrice;  
            
            return (  
              <Col key={plan.id} md={6} lg={3} className="mb-3">  
                <Card className="border-primary">  
                  <Card.Body className="p-3">  
                    <h6>{plan.name}</h6>  
                    <div className="fs-5 fw-bold mb-1">{formatCurrency(totalCost)}</div>  
                    <small className="text-muted">  
                      Plan price {formatCurrency(plan.price)} + {paidRides} times paid ride  
                      <br />  
                      (Used {freeUnlocksUsed} free unlocks)  
                    </small>  
                  </Card.Body>  
                </Card>  
              </Col>  
            );  
          })}  
        </Row>  
      </div>  
    </div>  
  );  
  
  // 促销优惠表格  
  const PromotionsTable = () => (  
    <div>  
      <div className="d-flex justify-content-between mb-3">  
        <h5>Promotions Settings</h5>  
        <Button variant="outline-primary" size="sm" onClick={() => prepareNewItem('promotions')}>  
          <FaPlus className="me-1" /> Add Promotion  
        </Button>  
      </div>  
      
      <Table responsive hover>  
        <thead>  
          <tr>  
            <th>Promotion Name</th>  
            <th>Promo Code</th>  
            <th>Discount Type</th>  
            <th>Discount Value</th>  
            <th>Maximum Discount</th>  
            <th>Validity Period</th>  
            <th>Status</th>  
            <th>Actions</th>  
          </tr>  
        </thead>  
        <tbody>  
          {pricingConfig.promotions.map(promo => (  
            <tr key={promo.id} className={!promo.active ? 'text-muted' : ''}>  
              <td>  
                <Form.Control  
                  type="text"  
                  value={promo.name}  
                  onChange={(e) => handlePromotionChange(promo.id, 'name', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <Form.Control  
                  type="text"  
                  value={promo.code}  
                  onChange={(e) => handlePromotionChange(promo.id, 'code', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <Form.Select  
                  value={promo.discountType}  
                  onChange={(e) => handlePromotionChange(promo.id, 'discountType', e.target.value)}  
                  size="sm"  
                >  
                  <option value="percentage">Percentage Discount</option>  
                  <option value="fixed">Fixed Amount</option>  
                </Form.Select>  
              </td>  
              <td>  
                <InputGroup size="sm">  
                  <Form.Control  
                    type="number"  
                    value={promo.discountValue}  
                    onChange={(e) => handlePromotionChange(promo.id, 'discountValue', e.target.value)}  
                    min="0"  
                    step={promo.discountType === 'percentage' ? '1' : '0.01'}  
                  />  
                  <InputGroup.Text>{promo.discountType === 'percentage' ? '%' : '¥'}</InputGroup.Text>  
                </InputGroup>  
              </td>  
              <td>  
                <InputGroup size="sm">  
                  <Form.Control  
                    type="number"  
                    value={promo.maxDiscount === null ? '' : promo.maxDiscount}  
                    onChange={(e) => handlePromotionChange(promo.id, 'maxDiscount', e.target.value === '' ? null : e.target.value)}  
                    min="0"  
                    step="0.01"  
                    placeholder="No limit"  
                  />  
                  <InputGroup.Text>¥</InputGroup.Text>  
                </InputGroup>  
              </td>  
              <td>  
                <div className="d-flex gap-1">  
                  <Form.Control  
                    type="date"  
                    value={promo.startDate}  
                    onChange={(e) => handlePromotionChange(promo.id, 'startDate', e.target.value)}  
                    size="sm"  
                  />  
                  <span>-</span>  
                  <Form.Control  
                    type="date"  
                    value={promo.endDate}  
                    onChange={(e) => handlePromotionChange(promo.id, 'endDate', e.target.value)}  
                    size="sm"  
                  />  
                </div>  
              </td>  
              <td>  
                <Form.Check  
                  type="switch"  
                  id={`promo-status-${promo.id}`}  
                  checked={promo.active}  
                  onChange={() => handlePromotionChange(promo.id, 'active')}  
                  label={promo.active ? 'Enabled' : 'Disabled'}  
                />  
              </td>  
              <td>  
                <Button  
                  variant="outline-danger"  
                  size="sm"  
                  onClick={() => {  
                    setItemToDelete({ category: 'promotions', id: promo.id, name: promo.name });  
                    setShowDeleteModal(true);  
                  }}  
                >  
                  <FaTrash />  
                </Button>  
              </td>  
            </tr>  
          ))}  
        </tbody>  
      </Table>  
      
      <div className="pricing-preview p-3 bg-light rounded my-4">  
        <h5>Promotion Effect Example</h5>  
        <p className="mb-3">Discounted price for a 15 minutes ride:</p>  
        <Row>  
          <Col md={6} lg={3} className="mb-3">  
            <Card>  
              <Card.Body className="p-3">  
                <h6>Base Price</h6>  
                <div className="fs-5 fw-bold mb-1">  
                  {formatCurrency(Math.max(  
                    pricingConfig.baseRate.unlockFee + 15 * pricingConfig.baseRate.perMinuteRate,  
                    pricingConfig.baseRate.minimumFare  
                  ))}  
                </div>  
                <small className="text-muted">  
                  No discount  
                </small>  
              </Card.Body>  
            </Card>  
          </Col>  
          
          {pricingConfig.promotions.filter(promo => promo.active).map(promo => {  
            const basePrice = Math.max(  
              pricingConfig.baseRate.unlockFee + 15 * pricingConfig.baseRate.perMinuteRate,  
              pricingConfig.baseRate.minimumFare  
            );  
            
            let discountAmount;  
            if (promo.discountType === 'percentage') {  
              discountAmount = basePrice * (promo.discountValue / 100);  
            } else {  
              discountAmount = promo.discountValue;  
            }  
            
            // 应用最高折扣限制  
            if (promo.maxDiscount !== null && discountAmount > promo.maxDiscount) {  
              discountAmount = promo.maxDiscount;  
            }  
            
            // 确保折扣不超过原价  
            discountAmount = Math.min(discountAmount, basePrice);  
            
            const finalPrice = basePrice - discountAmount;  
            
            return (  
              <Col key={promo.id} md={6} lg={3} className="mb-3">  
                <Card className="border-success">  
                  <Card.Body className="p-3">  
                    <div className="d-flex justify-content-between">  
                      <h6>{promo.name}</h6>  
                      <Badge bg="success">{promo.code}</Badge>  
                    </div>  
                    <div className="fs-5 fw-bold mb-1">{formatCurrency(finalPrice)}</div>  
                    <small className="text-muted">  
                      {formatCurrency(basePrice)} - {formatCurrency(discountAmount)} discount  
                      <br />  
                      {promo.discountType === 'percentage' ?   
                        `${promo.discountValue}% discount` :   
                        `Fixed discount ${formatCurrency(promo.discountValue)}`}  
                    </small>  
                  </Card.Body>  
                </Card>  
              </Col>  
            );  
          })}  
        </Row>  
      </div>  
    </div>  
  );  
  
  // 特殊事件表格  
  const SpecialEventsTable = () => (  
    <div>  
      <div className="d-flex justify-content-between mb-3">  
        <h5>Special Events Pricing</h5>  
        <Button variant="outline-primary" size="sm" onClick={() => prepareNewItem('specialEvents')}>  
          <FaPlus className="me-1" /> Add Event  
        </Button>  
      </div>  
      
      <Table responsive hover>  
        <thead>  
          <tr>  
            <th>Event Name</th>  
            <th>Start Date</th>  
            <th>End Date</th>  
            <th>Multiplier</th>  
            <th>Description</th>  
            <th>Status</th>  
            <th>Actions</th>  
          </tr>  
        </thead>  
        <tbody>  
          {pricingConfig.specialEvents.map(event => (  
            <tr key={event.id} className={!event.active ? 'text-muted' : ''}>  
              <td>  
                <Form.Control  
                  type="text"  
                  value={event.name}  
                  onChange={(e) => handleSpecialEventChange(event.id, 'name', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <Form.Control  
                  type="date"  
                  value={event.startDate}  
                  onChange={(e) => handleSpecialEventChange(event.id, 'startDate', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <Form.Control  
                  type="date"  
                  value={event.endDate}  
                  onChange={(e) => handleSpecialEventChange(event.id, 'endDate', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <InputGroup size="sm">  
                  <Form.Control  
                    type="number"  
                    value={event.multiplier}  
                    onChange={(e) => handleSpecialEventChange(event.id, 'multiplier', e.target.value)}  
                    min="0"  
                    step="0.05"  
                  />  
                  <InputGroup.Text>×</InputGroup.Text>  
                </InputGroup>  
              </td>  
              <td>  
                <Form.Control  
                  type="text"  
                  value={event.description}  
                  onChange={(e) => handleSpecialEventChange(event.id, 'description', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <Form.Check  
                  type="switch"  
                  id={`event-status-${event.id}`}  
                  checked={event.active}  
                  onChange={() => handleSpecialEventChange(event.id, 'active')}  
                  label={event.active ? 'Enabled' : 'Disabled'}  
                />  
              </td>  
              <td>  
                <Button  
                  variant="outline-danger"  
                  size="sm"  
                  onClick={() => {  
                    setItemToDelete({ category: 'specialEvents', id: event.id, name: event.name });  
                    setShowDeleteModal(true);  
                  }}  
                >  
                  <FaTrash />  
                </Button>  
              </td>  
            </tr>  
          ))}  
        </tbody>  
      </Table>  
      
      <div className="pricing-preview p-3 bg-light rounded my-4">  
        <h5>Special Events Price Example</h5>  
        <p className="mb-3">15 minutes ride price during special events:</p>  
        <Row>  
          <Col md={6} lg={3} className="mb-3">  
            <Card>  
              <Card.Body className="p-3">  
                <h6>Base Price</h6>  
                <div className="fs-5 fw-bold mb-1">  
                  {formatCurrency(Math.max(  
                    pricingConfig.baseRate.unlockFee + 15 * pricingConfig.baseRate.perMinuteRate,  
                    pricingConfig.baseRate.minimumFare  
                  ))}  
                </div>  
                <small className="text-muted">  
                  No special event adjustment  
                </small>  
              </Card.Body>  
            </Card>  
          </Col>  
          
          {pricingConfig.specialEvents.filter(event => event.active).map(event => {  
            const basePrice = Math.max(  
              pricingConfig.baseRate.unlockFee + 15 * pricingConfig.baseRate.perMinuteRate,  
              pricingConfig.baseRate.minimumFare  
            );  
            const adjustedPrice = basePrice * event.multiplier;  
            
            return (  
              <Col key={event.id} md={6} lg={3} className="mb-3">  
                <Card className="border-warning">  
                  <Card.Body className="p-3">  
                    <h6>{event.name}</h6>  
                    <div className="fs-5 fw-bold mb-1">{formatCurrency(adjustedPrice)}</div>  
                    <small className="text-muted">  
                      Base price {formatCurrency(basePrice)} × {event.multiplier}  
                      <br />  
                      Validity: {event.startDate} to {event.endDate}  
                    </small>  
                  </Card.Body>  
                </Card>  
              </Col>  
            );  
          })}  
        </Row>  
      </div>  
    </div>  
  );  
  
  // 区域定价表格  
  const ZonePricingTable = () => (  
    <div>  
      <div className="d-flex justify-content-between mb-3">  
        <h5>Zone Pricing Settings</h5>  
        <Button variant="outline-primary" size="sm" onClick={() => prepareNewItem('zonePricing')}>  
          <FaPlus className="me-1" /> Add Zone  
        </Button>  
      </div>  
      
      <div className="mb-4 p-3 bg-light rounded">  
        <div className="d-flex align-items-center mb-2">  
          <FaInfoCircle className="text-primary me-2" />  
          <span>Zone pricing will adjust prices based on the scooter's location. You can define different zones on the map and set price multipliers.</span>  
        </div>  
        <div className="map-placeholder bg-white p-5 text-center rounded">  
          <FaMapMarkedAlt size={32} className="mb-3 text-muted" />  
          <p>This will display the map interface for zone settings</p>  
        </div>  
      </div>  
      
      <Table responsive hover>  
        <thead>  
          <tr>  
            <th>Zone Name</th>  
            <th>Multiplier</th>  
            <th>Color</th>  
            <th>Status</th>  
            <th>Actions</th>  
          </tr>  
        </thead>  
        <tbody>  
          {pricingConfig.zonePricing.map(zone => (  
            <tr key={zone.id} className={!zone.active ? 'text-muted' : ''}>  
              <td>  
                <Form.Control  
                  type="text"  
                  value={zone.name}  
                  onChange={(e) => handleZonePricingChange(zone.id, 'name', e.target.value)}  
                  size="sm"  
                />  
              </td>  
              <td>  
                <InputGroup size="sm">  
                  <Form.Control  
                    type="number"  
                    value={zone.multiplier}  
                    onChange={(e) => handleZonePricingChange(zone.id, 'multiplier', e.target.value)}  
                    min="0"  
                    step="0.05"  
                  />  
                  <InputGroup.Text>×</InputGroup.Text>  
                </InputGroup>  
              </td>  
              <td>  
                <Form.Control  
                  type="color"  
                  value={zone.color}  
                  onChange={(e) => handleZonePricingChange(zone.id, 'color', e.target.value)}  
                  title="Select zone color"  
                  size="sm"  
                  style={{ width: '60px' }}  
                />  
              </td>  
              <td>  
                <Form.Check  
                  type="switch"  
                  id={`zone-status-${zone.id}`}  
                  checked={zone.active}  
                  onChange={() => handleZonePricingChange(zone.id, 'active')}  
                  label={zone.active ? 'Enabled' : 'Disabled'}  
                />  
              </td>  
              <td>  
                <Button  
                  variant="outline-danger"  
                  size="sm"  
                  onClick={() => {  
                    setItemToDelete({ category: 'zonePricing', id: zone.id, name: zone.name });  
                    setShowDeleteModal(true);  
                  }}  
                >  
                  <FaTrash />  
                </Button>  
              </td>  
            </tr>  
          ))}  
        </tbody>  
      </Table>  
      
      <div className="pricing-preview p-3 bg-light rounded my-4">  
        <h5>Zone Pricing Example</h5>  
        <p className="mb-3">15 minutes ride price in different zones:</p>  
        <Row>  
          <Col md={6} lg={3} className="mb-3">  
            <Card>  
              <Card.Body className="p-3">  
                <h6>Base Zone</h6>  
                <div className="fs-5 fw-bold mb-1">  
                  {formatCurrency(Math.max(  
                    pricingConfig.baseRate.unlockFee + 15 * pricingConfig.baseRate.perMinuteRate,  
                    pricingConfig.baseRate.minimumFare  
                  ))}  
                </div>  
                <small className="text-muted">  
                  No zone adjustment  
                </small>  
              </Card.Body>  
            </Card>  
          </Col>  
          
          {pricingConfig.zonePricing.filter(zone => zone.active).map(zone => {  
            const basePrice = Math.max(  
              pricingConfig.baseRate.unlockFee + 15 * pricingConfig.baseRate.perMinuteRate,  
              pricingConfig.baseRate.minimumFare  
            );  
            const adjustedPrice = basePrice * zone.multiplier;  
            
            return (  
              <Col key={zone.id} md={6} lg={3} className="mb-3">  
                <Card style={{ borderColor: zone.color }}>  
                  <Card.Body className="p-3">  
                    <h6 style={{ color: zone.color }}>{zone.name}</h6>  
                    <div className="fs-5 fw-bold mb-1">{formatCurrency(adjustedPrice)}</div>  
                    <small className="text-muted">  
                      Base price {formatCurrency(basePrice)} × {zone.multiplier}  
                    </small>  
                  </Card.Body>  
                </Card>  
              </Col>  
            );  
          })}  
        </Row>  
      </div>  
    </div>  
  );  
  
  return (  
    <Container fluid className="py-4">  
      <Row className="mb-4">  
        <Col>  
          <h2 className="mb-1">Pricing Settings</h2>  
          <p className="text-muted">Manage all pricing strategies for scooter rentals</p>  
        </Col>  
        <Col xs="auto" className="d-flex gap-2">  
          <Button   
            variant="outline-secondary"   
            onClick={() => setShowHistoryModal(true)}  
          >  
            <FaHistory className="me-1" /> Price History  
          </Button>  
          <Button   
            variant="outline-secondary"   
            onClick={handleReset}  
            disabled={!isDirty}  
          >  
            <FaUndo className="me-1" /> Reset Changes  
          </Button>  
          <Button   
            variant="primary"   
            onClick={handleSave}  
            disabled={!isDirty}  
          >  
            <FaSave className="me-1" /> Save Settings  
          </Button>  
        </Col>  
      </Row>  
      
      {message.show && (  
        <Alert   
          variant={message.type}   
          onClose={() => setMessage({ ...message, show: false })}   
          dismissible  
          className="mb-4"  
        >  
          {message.content}  
        </Alert>  
      )}  
      
      {isDirty && priceChangeSummary.length > 0 && (  
        <Alert variant="info" className="mb-4">  
          <div className="d-flex">  
            <FaInfoCircle className="me-2 mt-1" />  
            <div>  
              <strong>Price Change Summary:</strong>  
              <ul className="mb-0 mt-1">  
                {priceChangeSummary.map((change, idx) => (  
                  <li key={idx}>  
                    {change.category} - {change.field}: {change.from} → {change.to}  
                  </li>  
                ))}  
              </ul>  
            </div>  
          </div>  
        </Alert>  
      )}  
      
      <Card className="border-0 shadow-sm mb-4">  
        <Card.Body>  
          <Tabs  
            activeKey={activeTab}  
            onSelect={handleTabChange}  
            className="mb-4"  
          >  
            <Tab eventKey="baseRate" title={<span><FaPercentage className="me-1" /> Base Rate</span>}>  
              <BaseRateForm />  
            </Tab>  
            <Tab eventKey="timeBasedRates" title={<span><FaClock className="me-1" /> Time-Based Rates</span>}>  
              <TimeBasedRatesTable />  
            </Tab>  
            <Tab eventKey="membershipPlans" title={<span><FaUserTag className="me-1" /> Membership Plans</span>}>  
              <MembershipPlansTable />  
            </Tab>  
            <Tab eventKey="promotions" title={<span><FaPercentage className="me-1" /> Promotions</span>}>  
              <PromotionsTable />  
            </Tab>  
            <Tab eventKey="specialEvents" title={<span><FaCalendarAlt className="me-1" /> Special Events</span>}>  
              <SpecialEventsTable />  
            </Tab>  
            <Tab eventKey="zonePricing" title={<span><FaMapMarkedAlt className="me-1" /> Zone Pricing</span>}>  
              <ZonePricingTable />  
            </Tab>  
          </Tabs>  
        </Card.Body>  
      </Card>  
      
      {/* 历史记录模态框 */}  
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">  
        <Modal.Header closeButton>  
          <Modal.Title>Price Change History</Modal.Title>  
        </Modal.Header>  
        <Modal.Body>  
          <Table responsive hover>  
            <thead>  
              <tr>  
              <th>Date</th>  
                <th>Operator</th>  
                <th>Change Details</th>  
                <th>Category</th>  
              </tr>  
            </thead>  
            <tbody>  
              {pricingHistory.map(item => (  
                <tr key={item.id}>  
                  <td>{item.date}</td>  
                  <td>{item.user}</td>  
                  <td>{item.changes}</td>  
                  <td>  
                    <Badge bg={  
                      item.type === 'baseRate' ? 'primary' :  
                      item.type === 'timeBasedRates' ? 'info' :  
                      item.type === 'membershipPlans' ? 'success' :  
                      item.type === 'promotions' ? 'warning' :  
                      item.type === 'zonePricing' ? 'danger' : 'secondary'  
                    }>  
                      {  
                        item.type === 'baseRate' ? 'Base Rate' :  
                        item.type === 'timeBasedRates' ? 'Time-Based Rates' :  
                        item.type === 'membershipPlans' ? 'Membership Plans' :  
                        item.type === 'promotions' ? 'Promotions' :  
                        item.type === 'specialEvents' ? 'Special Events' :  
                        item.type === 'zonePricing' ? 'Zone Pricing' : 'Other'  
                      }  
                    </Badge>  
                  </td>  
                </tr>  
              ))}  
            </tbody>  
          </Table>  
        </Modal.Body>  
        <Modal.Footer>  
          <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>  
            关闭  
          </Button>  
        </Modal.Footer>  
      </Modal>  
      
      {/* 删除确认模态框 */}  
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>  
        <Modal.Header closeButton>  
          <Modal.Title>确认删除</Modal.Title>  
        </Modal.Header>  
        <Modal.Body>  
          <div className="d-flex">  
            <div className="me-3">  
              <FaExclamationTriangle size={24} className="text-warning" />  
            </div>  
            <div>  
              <p>您确定要删除以下项目吗？</p>  
              <p className="fw-bold">{itemToDelete?.name}</p>  
              <p className="mb-0 text-muted">此操作无法撤销，删除后相关价格设置将不再生效。</p>  
            </div>  
          </div>  
        </Modal.Body>  
        <Modal.Footer>  
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>  
            取消  
          </Button>  
          <Button variant="danger" onClick={handleDeleteItem}>  
            确认删除  
          </Button>  
        </Modal.Footer>  
      </Modal>  
      
      {/* 添加新项目模态框 */}  
      <Modal show={showNewItemModal} onHide={() => setShowNewItemModal(false)}>  
        <Modal.Header closeButton>  
          <Modal.Title>  
            添加  
            {newItem?.category === 'timeBasedRates' && '时段定价'}  
            {newItem?.category === 'membershipPlans' && '会员套餐'}  
            {newItem?.category === 'promotions' && '促销优惠'}  
            {newItem?.category === 'specialEvents' && '特殊事件'}  
            {newItem?.category === 'zonePricing' && '区域定价'}  
          </Modal.Title>  
        </Modal.Header>  
        <Modal.Body>  
          {newItem?.category === 'timeBasedRates' && (  
            <Form>  
              <Form.Group className="mb-3">  
                <Form.Label>时段名称</Form.Label>  
                <Form.Control  
                  type="text"  
                  value={newItem.name}  
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}  
                />  
              </Form.Group>  
              <Row>  
                <Col>  
                  <Form.Group className="mb-3">  
                    <Form.Label>开始时间</Form.Label>  
                    <Form.Control  
                      type="time"  
                      value={newItem.startTime}  
                      onChange={(e) => setNewItem({...newItem, startTime: e.target.value})}  
                    />  
                  </Form.Group>  
                </Col>  
                <Col>  
                  <Form.Group className="mb-3">  
                    <Form.Label>结束时间</Form.Label>  
                    <Form.Control  
                      type="time"  
                      value={newItem.endTime}  
                      onChange={(e) => setNewItem({...newItem, endTime: e.target.value})}  
                    />  
                  </Form.Group>  
                </Col>  
              </Row>  
              <Form.Group className="mb-3">  
                <Form.Label>价格系数</Form.Label>  
                <InputGroup>  
                  <Form.Control  
                    type="number"  
                    value={newItem.multiplier}  
                    onChange={(e) => setNewItem({...newItem, multiplier: parseFloat(e.target.value)})}  
                    min="0"  
                    step="0.05"  
                  />  
                  <InputGroup.Text>×</InputGroup.Text>  
                </InputGroup>  
                <Form.Text className="text-muted">  
                  基础价格将乘以此系数，1.0表示无变化，小于1表示折扣，大于1表示溢价  
                </Form.Text>  
              </Form.Group>  
            </Form>  
          )}  
          
          {newItem?.category === 'membershipPlans' && (  
            <Form>  
              <Form.Group className="mb-3">  
                <Form.Label>套餐名称</Form.Label>  
                <Form.Control  
                  type="text"  
                  value={newItem.name}  
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}  
                />  
              </Form.Group>  
              <Form.Group className="mb-3">  
                <Form.Label>价格</Form.Label>  
                <InputGroup>  
                  <InputGroup.Text>¥</InputGroup.Text>  
                  <Form.Control  
                    type="number"  
                    value={newItem.price}  
                    onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value)})}  
                    min="0"  
                    step="0.01"  
                  />  
                </InputGroup>  
              </Form.Group>  
              <Row>  
                <Col>  
                  <Form.Group className="mb-3">  
                    <Form.Label>折扣比例 (%)</Form.Label>  
                    <InputGroup>  
                      <Form.Control  
                        type="number"  
                        value={newItem.discountPercentage}  
                        onChange={(e) => setNewItem({...newItem, discountPercentage: parseFloat(e.target.value)})}  
                        min="0"  
                        max="100"  
                      />  
                      <InputGroup.Text>%</InputGroup.Text>  
                    </InputGroup>  
                  </Form.Group>  
                </Col>  
                <Col>  
                  <Form.Group className="mb-3">  
                    <Form.Label>免费解锁次数</Form.Label>  
                    <Form.Control  
                      type="number"  
                      value={newItem.freeUnlocks}  
                      onChange={(e) => setNewItem({...newItem, freeUnlocks: parseInt(e.target.value)})}  
                      min="0"  
                    />  
                  </Form.Group>  
                </Col>  
              </Row>  
              <Form.Group className="mb-3">  
                <Form.Label>描述</Form.Label>  
                <Form.Control  
                  as="textarea"  
                  rows={2}  
                  value={newItem.description}  
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}  
                />  
              </Form.Group>  
            </Form>  
          )}  
          
          {newItem?.category === 'promotions' && (  
            <Form>  
              <Form.Group className="mb-3">  
                <Form.Label>促销名称</Form.Label>  
                <Form.Control  
                  type="text"  
                  value={newItem.name}  
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}  
                />  
              </Form.Group>  
              <Form.Group className="mb-3">  
                <Form.Label>优惠码</Form.Label>  
                <Form.Control  
                  type="text"  
                  value={newItem.code}  
                  onChange={(e) => setNewItem({...newItem, code: e.target.value})}  
                />  
                <Form.Text className="text-muted">  
                  用户输入此代码获得折扣，建议使用大写字母和数字  
                </Form.Text>  
              </Form.Group>  
              <Row>  
                <Col>  
                  <Form.Group className="mb-3">  
                    <Form.Label>折扣类型</Form.Label>  
                    <Form.Select  
                      value={newItem.discountType}  
                      onChange={(e) => setNewItem({...newItem, discountType: e.target.value})}  
                    >  
                      <option value="percentage">百分比折扣</option>  
                      <option value="fixed">固定金额</option>  
                    </Form.Select>  
                  </Form.Group>  
                </Col>  
                <Col>  
                  <Form.Group className="mb-3">  
                    <Form.Label>折扣值</Form.Label>  
                    <InputGroup>  
                      <Form.Control  
                        type="number"  
                        value={newItem.discountValue}  
                        onChange={(e) => setNewItem({...newItem, discountValue: parseFloat(e.target.value)})}  
                        min="0"  
                        step={newItem.discountType === 'percentage' ? '1' : '0.01'}  
                      />  
                      <InputGroup.Text>{newItem.discountType === 'percentage' ? '%' : '¥'}</InputGroup.Text>  
                    </InputGroup>  
                  </Form.Group>  
                </Col>  
              </Row>  
              <Form.Group className="mb-3">  
                <Form.Label>最高折扣金额</Form.Label>  
                <InputGroup>  
                  <InputGroup.Text>¥</InputGroup.Text>  
                  <Form.Control  
                    type="number"  
                    value={newItem.maxDiscount === null ? '' : newItem.maxDiscount}  
                    onChange={(e) => setNewItem({...newItem, maxDiscount: e.target.value === '' ? null : parseFloat(e.target.value)})}  
                    min="0"  
                    step="0.01"  
                    placeholder="无上限"  
                  />  
                </InputGroup>  
                <Form.Text className="text-muted">  
                  留空表示没有折扣上限  
                </Form.Text>  
              </Form.Group>  
              <Row>  
                <Col>  
                  <Form.Group className="mb-3">  
                    <Form.Label>开始日期</Form.Label>  
                    <Form.Control  
                      type="date"  
                      value={newItem.startDate}  
                      onChange={(e) => setNewItem({...newItem, startDate: e.target.value})}  
                    />  
                  </Form.Group>  
                </Col>  
                <Col>  
                  <Form.Group className="mb-3">  
                    <Form.Label>结束日期</Form.Label>  
                    <Form.Control  
                      type="date"  
                      value={newItem.endDate}  
                      onChange={(e) => setNewItem({...newItem, endDate: e.target.value})}  
                    />  
                  </Form.Group>  
                </Col>  
              </Row>  
            </Form>  
          )}  
          
          {newItem?.category === 'specialEvents' && (  
            <Form>  
              <Form.Group className="mb-3">  
                <Form.Label>事件名称</Form.Label>  
                <Form.Control  
                  type="text"  
                  value={newItem.name}  
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}  
                />  
              </Form.Group>  
              <Row>  
                <Col>  
                  <Form.Group className="mb-3">  
                    <Form.Label>开始日期</Form.Label>  
                    <Form.Control  
                      type="date"  
                      value={newItem.startDate}  
                      onChange={(e) => setNewItem({...newItem, startDate: e.target.value})}  
                    />  
                  </Form.Group>  
                </Col>  
                <Col>  
                  <Form.Group className="mb-3">  
                    <Form.Label>结束日期</Form.Label>  
                    <Form.Control  
                      type="date"  
                      value={newItem.endDate}  
                      onChange={(e) => setNewItem({...newItem, endDate: e.target.value})}  
                    />  
                  </Form.Group>  
                </Col>  
              </Row>  
              <Form.Group className="mb-3">  
                <Form.Label>价格系数</Form.Label>  
                <InputGroup>  
                  <Form.Control  
                    type="number"  
                    value={newItem.multiplier}  
                    onChange={(e) => setNewItem({...newItem, multiplier: parseFloat(e.target.value)})}  
                    min="0"  
                    step="0.05"  
                  />  
                  <InputGroup.Text>×</InputGroup.Text>  
                </InputGroup>  
                <Form.Text className="text-muted">  
                  基础价格将乘以此系数，小于1表示折扣，大于1表示溢价  
                </Form.Text>  
              </Form.Group>  
              <Form.Group className="mb-3">  
                <Form.Label>描述</Form.Label>  
                <Form.Control  
                  as="textarea"  
                  rows={2}  
                  value={newItem.description}  
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}  
                />  
              </Form.Group>  
            </Form>  
          )}  
          
          {newItem?.category === 'zonePricing' && (  
            <Form>  
              <Form.Group className="mb-3">  
                <Form.Label>区域名称</Form.Label>  
                <Form.Control  
                  type="text"  
                  value={newItem.name}  
                  onChange={(e) => setNewItem({...newItem, name: e.target.value})}  
                />  
              </Form.Group>  
              <Form.Group className="mb-3">  
                <Form.Label>价格系数</Form.Label>  
                <InputGroup>  
                  <Form.Control  
                    type="number"  
                    value={newItem.multiplier}  
                    onChange={(e) => setNewItem({...newItem, multiplier: parseFloat(e.target.value)})}  
                    min="0"  
                    step="0.05"  
                  />  
                  <InputGroup.Text>×</InputGroup.Text>  
                </InputGroup>  
                <Form.Text className="text-muted">  
                  基础价格将乘以此系数，小于1表示折扣，大于1表示溢价  
                </Form.Text>  
              </Form.Group>  
              <Form.Group className="mb-3">  
                <Form.Label>区域颜色</Form.Label>  
                <Form.Control  
                  type="color"  
                  value={newItem.color}  
                  onChange={(e) => setNewItem({...newItem, color: e.target.value})}  
                  title="选择区域颜色"  
                />  
                <Form.Text className="text-muted">  
                  此颜色将在地图上用于标识该区域  
                </Form.Text>  
              </Form.Group>  
              <div className="map-placeholder bg-light p-3 text-center rounded mb-3">  
                <small className="text-muted">区域边界将在地图上设置</small>  
              </div>  
            </Form>  
          )}  
        </Modal.Body>  
        <Modal.Footer>  
          <Button variant="outline-secondary" onClick={() => setShowNewItemModal(false)}>  
            取消  
          </Button>  
          <Button variant="primary" onClick={handleAddNewItem}>  
            添加  
          </Button>  
        </Modal.Footer>  
      </Modal>  
      
      {/* 未保存更改确认模态框 */}  
      <Modal show={showExitModal} onHide={() => setShowExitModal(false)}>  
        <Modal.Header closeButton>  
          <Modal.Title>未保存的更改</Modal.Title>  
        </Modal.Header>  
        <Modal.Body>  
          <div className="d-flex">  
            <div className="me-3">  
              <FaExclamationTriangle size={24} className="text-warning" />  
            </div>  
            <div>  
              <p>您有未保存的价格设置更改，离开此页面将丢失这些更改。</p>  
              <p className="mb-0">您确定要离开吗？</p>  
            </div>  
          </div>  
        </Modal.Body>  
        <Modal.Footer>  
          <Button variant="outline-secondary" onClick={() => setShowExitModal(false)}>  
            留在当前页面  
          </Button>  
          <Button variant="danger" onClick={confirmExit}>  
            离开并放弃更改  
          </Button>  
          <Button variant="primary" onClick={handleSave}>  
            <FaSave className="me-1" /> 保存并离开  
          </Button>  
        </Modal.Footer>  
      </Modal>  
    </Container>  
  );  
};  

export default PricingSettings;