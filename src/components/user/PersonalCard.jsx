import React, { useState, useEffect } from 'react';
import {
  Button,
  Badge,
  Modal,
  Form,
  Spinner,
  Alert
} from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaEdit
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/PersonalCard.css';
import api from '../../services/api';
import userService from '../../services/user.service';

const PersonalCard = () => {
  const { currentUser, updateUser } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    email: '',
    phone: ''
  });
  const [verifying, setVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        email: currentUser.email || '',
        phone: currentUser.phone || ''
      });
    }
  }, [currentUser]);

  const handleProfileUpdate = async () => {
    try {
      setIsUpdating(true);
      await userService.updateUser(currentUser.username, {
        ...profileForm,
        role: currentUser.role
      });
      // 获取更新后的用户信息
      const updatedUser = await userService.getUserByUsername(currentUser.username);
      if (updatedUser) {
        // 使用 AuthContext 中的 updateUser 方法更新用户信息
        updateUser(updatedUser);
      }
      setShowEditProfile(false);
    } catch (error) {
      console.error('Failed to update personal info:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 认证按钮点击事件
  const handleVerifyDiscount = async () => {
    setVerifying(true);
    try {
      await api.post('/users/verify-discount');
      // 重新获取用户信息
      const res = await api.get(`/users/${currentUser.username}`);
      // 使用 AuthContext 中的 updateUser 方法更新用户信息
      updateUser(res.data);
      setVerifySuccess(true);
    } catch (e) {
      alert('认证失败，请重试');
    }
    setVerifying(false);
  };

  if (!currentUser) {
    return <Alert variant="warning">Please log in first</Alert>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <FaUser size={48} />
        </div>
        <div className="profile-info">
          <h2>{currentUser.username}</h2>
          <Badge bg="primary">User</Badge>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Personal Information</h3>
          {/* 认证状态与按钮 */}
          {currentUser.role === 'ROLE_DISCOUNT' ? (
            <Alert variant="success" className="mb-3">Verified student/senior, 20% discount applied</Alert>
          ) : (
            <Button 
              variant="success" 
              className="mb-3"
              onClick={handleVerifyDiscount}
              disabled={verifying}
            >
              {verifying ? 'Verifying...' : 'Student/Senior Verification (20% Discount)'}
            </Button>
          )}
          <div className="info-grid">
            <div className="info-item">
              <FaEnvelope className="icon" />
              <div>
                <label>Email</label>
                <span>{currentUser.email || 'Not set'}</span>
              </div>
            </div>
            <div className="info-item">
              <FaPhone className="icon" />
              <div>
                <label>Phone</label>
                <span>{currentUser.phone || 'Not set'}</span>
              </div>
            </div>
          </div>
          <Button 
            variant="outline-primary" 
            className="mt-3"
            onClick={() => setShowEditProfile(true)}
          >
            <FaEdit className="me-2" />
            Edit Personal Info
          </Button>
        </div>
      </div>

      {/* 编辑个人信息弹窗 */}
      <Modal show={showEditProfile} onHide={() => setShowEditProfile(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Personal Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditProfile(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleProfileUpdate}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PersonalCard; 