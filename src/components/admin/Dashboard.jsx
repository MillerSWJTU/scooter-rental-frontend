import React, { useState, useEffect } from 'react';  
import { Container, Row, Col, Card } from 'react-bootstrap';  
import { FaUsers, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';  
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, LineChart, Line 
} from 'recharts';  
import adminService from '../../services/admin.service';  

const Dashboard = () => {  
  const [stats, setStats] = useState({  
    totalUsers: 0,  
    totalRentals: 0,
    totalRevenue: 0
  });  
  
  const [weeklyRentalIncome, setWeeklyRentalIncome] = useState([]);  
  const [rentalPlanStats, setRentalPlanStats] = useState([]);
  const [combinedDailyIncome, setCombinedDailyIncome] = useState([]);
  const [isLoading, setIsLoading] = useState(true);  
  const [error, setError] = useState(null);
  
  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0'];  
  const RENTAL_PLANS = {
    'HOURLY': '1 Hour',
    'FOUR_HOURS': '4 Hours',
    'DAILY': '1 Day',
    'WEEKLY': '1 Week'
  };

  useEffect(() => {  
    const fetchDashboardData = async () => {  
      try {  
        setIsLoading(true);  
        setError(null);
        
        // Fetch weekly income by rental plan
        const weeklyIncomeData = await adminService.getRevenueWeekly();
        setWeeklyRentalIncome(weeklyIncomeData);

        // Fetch rental plan statistics
        const planStats = await adminService.getRentalPlanStats();
        setRentalPlanStats(planStats);

        // Fetch daily revenue
        try {
          const dailyIncomeData = await adminService.getRevenueDaily();
          setCombinedDailyIncome(dailyIncomeData);
        } catch (err) {
          console.error('Failed to fetch daily revenue:', err);
        }
        
        // Fetch total stats
        const statsData = await adminService.getDashboardStats();
        setStats(statsData);
        
        setIsLoading(false);  
      } catch (error) {  
        console.error('Failed to fetch dashboard data:', error);  
        setError(error.message || 'Failed to fetch data, please try again later');
        setIsLoading(false);  
      }  
    };  
    
    fetchDashboardData();  
  }, []);  

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading data...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Loading Failed</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Please check your network connection or try again later.</p>
        </div>
      </Container>
    );
  }

  return (  
    <Container fluid className="py-4">  
      <Row className="mb-4">  
        <Col>  
          <h2 className="mb-1">Admin Dashboard</h2>  
          <p className="text-muted">System Overview and Statistics</p>  
        </Col>  
      </Row>  
      
      {/* Statistics Cards */}
      <Row className="g-3 mb-4">  
        <Col md={4}>  
          <Card className="h-100 border-0 shadow-sm">  
            <Card.Body>  
              <div className="d-flex justify-content-between align-items-center">  
                <div>  
                  <h6 className="text-muted mb-2">Total Users</h6>  
                  <h3 className="mb-0">{stats.totalUsers}</h3>  
                </div>  
                <div className="icon-bg bg-primary-light">  
                  <FaUsers className="text-primary" size={24} />  
                </div>  
              </div>  
            </Card.Body>  
          </Card>  
        </Col>  
        
        <Col md={4}>  
          <Card className="h-100 border-0 shadow-sm">  
            <Card.Body>  
              <div className="d-flex justify-content-between align-items-center">  
                <div>  
                  <h6 className="text-muted mb-2">Total Orders</h6>  
                  <h3 className="mb-0">{stats.totalRentals}</h3>  
                </div>  
                <div className="icon-bg bg-success-light">  
                  <FaMoneyBillWave className="text-success" size={24} />  
                </div>  
              </div>  
            </Card.Body>  
          </Card>  
        </Col>  

        <Col md={4}>  
          <Card className="h-100 border-0 shadow-sm">  
            <Card.Body>  
              <div className="d-flex justify-content-between align-items-center">  
                <div>  
                  <h6 className="text-muted mb-2">Total Revenue</h6>  
                  <h3 className="mb-0">¥{stats.totalRevenue}</h3>  
                </div>  
                <div className="icon-bg bg-warning-light">  
                  <FaChartLine className="text-warning" size={24} />  
                </div>  
              </div>  
            </Card.Body>  
          </Card>  
        </Col>  
      </Row>  
      
      {/* Weekly Income by Rental Plan */}
      <Row className="mb-4">
        <Col xl={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0">Weekly Income by Rental Plan</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={weeklyRentalIncome}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`¥${value}`, 'Income']} />
                  <Legend />
                  {Object.entries(RENTAL_PLANS).map(([key, label], index) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={label}
                      stroke={COLORS[index % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0">Rental Plan Distribution</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={rentalPlanStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="plan"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {rentalPlanStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Combined Daily Income */}
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0">Combined Daily Income (Last 7 Days)</h5>
              <p className="text-muted small">Tracking popular hire days across all rental types</p>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={combinedDailyIncome}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`¥${value}`, 'Income']} />
                  <Legend />
                  <Bar dataKey="income" name="Daily Income" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Rental Plan Statistics */}
      <Row className="mb-4">
        <Col xl={12}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0">Rental Plan Statistics</h5>
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={rentalPlanStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="plan" />
                  <YAxis yAxisId="left" orientation="left" stroke="#2196F3" />
                  <YAxis yAxisId="right" orientation="right" stroke="#FFC107" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="Number of Rentals" fill="#2196F3" />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue (¥)" fill="#FFC107" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>  
  );  
};  

export default Dashboard; 