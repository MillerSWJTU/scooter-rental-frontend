import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    password: false
  });

  // 每当表单数据更改时，验证相应的字段
  useEffect(() => {
    if (touched.username) {
      validateField('username', formData.username);
    }
    if (touched.password) {
      validateField('password', formData.password);
    }
  }, [formData, touched]);

  const validateField = (field, value) => {
    let newErrors = { ...errors };
    
    switch (field) {
      case 'username':
        if (!value.trim()) {
          newErrors.username = 'Username cannot be empty';
        } else {
          delete newErrors.username;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password cannot be empty';
        } else {
          delete newErrors.password;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // 用户名验证
    if (!formData.username) {
      newErrors.username = 'Username cannot be empty';
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = 'Password cannot be empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name, formData[name]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 标记所有字段为已触摸，以显示所有错误
    setTouched({
      username: true,
      password: true
    });
    
    if (!validateForm()) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(formData.username, formData.password);
      
      // Navigate to the page they were trying to access, or home
      const from = location.state?.from || '/';
      navigate(from);
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed, please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="mb-3">Login</h2>
                <p className="text-muted">Login to use scooter rental service</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {location.state?.message && (
                <Alert variant="success" className="mb-4">
                  {location.state.message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="username"
                    isInvalid={touched.username && !!errors.username}
                    placeholder="Please enter your username"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="current-password"
                    isInvalid={touched.password && !!errors.password}
                    placeholder="Please enter your password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="mb-3"
                  >
                    <FaSignInAlt className="me-2" />
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary">
                      Register Now
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;