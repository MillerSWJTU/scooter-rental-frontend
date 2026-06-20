import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUserPlus } from 'react-icons/fa';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    password: false,
    confirmPassword: false,
    email: false,
    phone: false
  });

  // 每当表单数据更改时，验证相应的字段
  useEffect(() => {
    Object.keys(touched).forEach(field => {
      if (touched[field]) {
        validateField(field, formData[field]);
      }
    });
    
    // 特殊处理确认密码，因为它依赖于密码字段
    if (touched.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword, formData.password);
    }
  }, [formData, touched]);

  const validateField = (field, value, passwordValue) => {
    let newErrors = { ...errors };
    
    switch (field) {
      case 'username':
        if (!value.trim()) {
          newErrors.username = 'Username cannot be empty';
        } else if (value.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else {
          delete newErrors.username;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'Email cannot be empty';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!value.trim()) {
          newErrors.phone = 'Phone Number cannot be empty';
        } else if (!phoneRegex.test(value)) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Password cannot be empty';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        
        // 如果确认密码已经被触碰，同时更新确认密码的验证
        if (touched.confirmPassword) {
          if (formData.confirmPassword !== value) {
            newErrors.confirmPassword = 'Passwords do not match';
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm password';
        } else if (value !== (passwordValue || formData.password)) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
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
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email cannot be empty';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // 手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = 'Phone Number cannot be empty';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // 密码验证
    if (!formData.password) {
      newErrors.password = 'Password cannot be empty';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // 确认密码验证
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      password: true,
      confirmPassword: true,
      email: true,
      phone: true
    });
    
    if (!validateForm()) {
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(formData);
      navigate('/login', { state: { message: 'Registration successful, please login.' } });
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed, please try again later');
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
                <h2 className="mb-3">Register Account</h2>
                <p className="text-muted">Create an account to use the scooter rental service</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
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
                    placeholder="Please enter a username (at least 3 characters)"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.username}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="email"
                    isInvalid={touched.email && !!errors.email}
                    placeholder="Please enter a valid email address"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="tel"
                    isInvalid={touched.phone && !!errors.phone}
                    placeholder="Please enter a 11-digit phone number"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="new-password"
                    isInvalid={touched.password && !!errors.password}
                    placeholder="Please enter password (at least 6 characters)"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    autoComplete="new-password"
                    isInvalid={touched.confirmPassword && !!errors.confirmPassword}
                    placeholder="Please enter password again"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <div className="d-grid">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="mb-3"
                  >
                    <FaUserPlus className="me-2" />
                    {loading ? 'Registering...' : 'Register'}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary">
                      Login
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

export default Register;