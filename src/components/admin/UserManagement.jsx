import React, { useState, useEffect } from 'react';  
import { Container, Row, Col, Card, Table, Form, Button, InputGroup, Modal, Badge, Alert } from 'react-bootstrap';
import { FaSearch, FaUserPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';  
import userService from '../../services/user.service';  

const UserManagement = () => {  
  const [users, setUsers] = useState([]);  
  const [filteredUsers, setFilteredUsers] = useState([]);  
  const [searchTerm, setSearchTerm] = useState('');  
  const [currentPage, setCurrentPage] = useState(1);  
  const [usersPerPage] = useState(10);  
  const [sortField, setSortField] = useState('createdAt');  
  const [sortDirection, setSortDirection] = useState('desc');  
  const [showAddModal, setShowAddModal] = useState(false);  
  const [showEditModal, setShowEditModal] = useState(false);  
  const [showDeleteModal, setShowDeleteModal] = useState(false);  
  const [selectedUser, setSelectedUser] = useState(null);  
  const [userForm, setUserForm] = useState({  
    username: '',  
    email: '',  
    phone: '',  
    role: 'ROLE_USER',  
    status: 'active',
    notes: '',
    password: ''
  });  
  const [validated, setValidated] = useState(false);  
  const [isLoading, setIsLoading] = useState(true);  
  const [message, setMessage] = useState({ type: '', text: '' });  
  const [filterOptions, setFilterOptions] = useState({  
    role: 'all',  
    status: 'all',  
    dateRange: 'all'  
  });  
  
  // 获取用户列表  
  useEffect(() => {  
    const fetchUsers = async () => {  
      try {  
        setIsLoading(true);  
        const response = await userService.getAllUsers();
        
        // Ensure response is an array
        if (Array.isArray(response)) {
          // Process backend data, add default status if not present
          const processedUsers = response.map(user => ({
            ...user,
            // If backend doesn't return status field, set active as default
            status: user.status || 'active'
          }));
          setUsers(processedUsers);
          setFilteredUsers(processedUsers);
        } else {
          console.warn('API response (users) is not an array:', response);
          setUsers([]);
          setFilteredUsers([]);
          setMessage({ type: 'warning', text: 'Unable to load user data, incorrect format' });
        }

        setIsLoading(false);  
      } catch (error) {  
        console.error('Failed to fetch user list:', error);  
        setUsers([]); // Reset to empty array on error
        setFilteredUsers([]); // Reset to empty array on error
        setMessage({ type: 'danger', text: 'Failed to fetch user list, please try again later' });  
        setIsLoading(false);  
      }  
    };  
    
    fetchUsers();  
  }, []);  
  
  // Search and filter
  useEffect(() => {  
    let filtered = [...users];

    // Search handling
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.includes(searchTerm))
      );
    }

    // Role filter
    if (filterOptions.role !== 'all') {
      filtered = filtered.filter(user => user.role === filterOptions.role);
    }

    // Status filter
    if (filterOptions.status !== 'all') {
      filtered = filtered.filter(user => 
        user.status.toLowerCase() === filterOptions.status.toLowerCase()
      );
    }

    // Date range filter
    if (filterOptions.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      filtered = filtered.filter(user => {
        const createdAt = new Date(user.createdAt);
        switch (filterOptions.dateRange) {
          case 'today':
            return createdAt >= today;
          case 'week':
            return createdAt >= weekAgo;
          case 'month':
            return createdAt >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page
  }, [users, searchTerm, filterOptions]);  
  
  // Create user
  const handleAddUser = async (e) => {  
    e.preventDefault();  
    const form = e.currentTarget;  
    
    if (form.checkValidity() === false) {  
      e.stopPropagation();  
      setValidated(true);  
      return;  
    }  
    
    try {  
      setValidated(true);
      // Ensure data format matches backend API
      const userData = {
        username: userForm.username,
        email: userForm.email,
        phone: userForm.phone,
        password: userForm.password,
        role: userForm.role
      };
      const newUser = await userService.createUser(userData);
      
      setUsers([newUser, ...users]);  
      setShowAddModal(false);  
      setMessage({ type: 'success', text: 'User created successfully' });  
      
      // Reset form
      setUserForm({  
        username: '',  
        email: '',  
        phone: '',  
        role: 'ROLE_USER',  
        status: 'active',
        password: ''
      });  
      setValidated(false);  
    } catch (error) {  
      console.error('Failed to create user:', error);  
      setMessage({ type: 'danger', text: 'Failed to create user, please try again later' });  
    }  
  };  
  
  // Edit user
  const handleEditUser = async (e) => {  
    e.preventDefault();  
    const form = e.currentTarget;  
    
    if (form.checkValidity() === false) {  
      e.stopPropagation();  
      setValidated(true);  
      return;  
    }  
    
    try {  
      setValidated(true);
      
      // Ensure data format matches backend API
      const userData = {
        email: userForm.email,
        phone: userForm.phone,
        role: userForm.role,
        // Only include password if it has a value
        ...(userForm.password ? { password: userForm.password } : {})
      };

      const updatedUser = await userService.updateUser(selectedUser.username, userData);
      
      const updatedUsers = users.map(user => {  
        if (user.username === selectedUser.username) {  
          return updatedUser;  
        }  
        return user;  
      });  
      
      setUsers(updatedUsers);  
      setShowEditModal(false);  
      setMessage({ type: 'success', text: 'User updated successfully' });  
      setValidated(false);  
    } catch (error) {  
      console.error('Failed to update user:', error);  
      setMessage({ type: 'danger', text: 'Failed to update user, please try again later' });  
    }  
  };  
  
  // Delete user
  const handleDeleteUser = async () => {  
    try {  
      await userService.deleteUser(selectedUser.username);
      
      const remainingUsers = users.filter(user => user.username !== selectedUser.username);  
      
      setUsers(remainingUsers);  
      setShowDeleteModal(false);  
      setMessage({ type: 'success', text: 'User deleted successfully' });  
    } catch (error) {  
      console.error('Failed to delete user:', error);  
      setMessage({ type: 'danger', text: 'Failed to delete user, please try again later' });  
    }  
  };  
  
  // Pagination handling
  const indexOfLastUser = currentPage * usersPerPage;  
  const indexOfFirstUser = indexOfLastUser - usersPerPage;  
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);  
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);  
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);  
  
  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    return pageNumbers;
  };

  // Handle page input
  const handlePageInput = (e) => {
    const value = parseInt(e.target.value);
    if (value && value > 0 && value <= totalPages) {
      paginate(value);
    }
  };

  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-between align-items-center mt-4">
        <div className="text-muted">
          Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
        </div>
        <div className="d-flex align-items-center">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className="me-2"
          >
            First
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="me-2"
          >
            Previous
          </Button>
          {getPageNumbers().map(number => (
            <Button
              key={number}
              variant={currentPage === number ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => paginate(number)}
              className="mx-1"
            >
              {number}
            </Button>
          ))}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="ms-2"
          >
            Next
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className="ms-2"
          >
            Last
          </Button>
          <div className="ms-3 d-flex align-items-center">
            <span className="me-2">Go to</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={handlePageInput}
              className="form-control form-control-sm"
              style={{ width: '60px' }}
            />
            <span className="ms-2">page</span>
          </div>
        </div>
      </div>
    );
  };
  
  // 打开编辑模态框  
  const openEditModal = (user) => {  
    setSelectedUser(user);  
    setUserForm({  
      username: user.username || '',  
      email: user.email || '',  
      phone: user.phone || '',  
      role: user.role || 'ROLE_USER',  
      status: user.status || 'active',
      notes: user.notes || '',
      password: ''
    });  
    setShowEditModal(true);  
  };  
  
  // 打开删除模态框  
  const openDeleteModal = (user) => {  
    setSelectedUser(user);  
    setShowDeleteModal(true);  
  };  
  
  // 获取角色显示文本
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'ROLE_USER':
        return 'User';
      case 'ROLE_ADMIN':
        return 'Admin';
      default:
        return 'Unknown Role';
    }
  };

  // 获取状态显示文本
  const getStatusDisplay = (status) => {
    // 检查status是否为空或undefined
    if (!status) return 'Active'; // 默认状态为活跃
    
    switch (status) {
      case 'active':
      case 'ACTIVE':
        return 'Active';
      case 'inactive':
      case 'INACTIVE':
        return 'Inactive';
      case 'pending':
      case 'PENDING':
        return 'Pending';
      default:
        return status; // 显示原始状态值，方便调试
    }
  };

  // 获取状态对应的样式
  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
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
  
  // 渲染筛选选项
  const renderFilterOptions = () => (
    <div className="d-flex flex-wrap gap-2 mb-3">
      <InputGroup style={{ width: 'auto' }}>
        <InputGroup.Text>Role</InputGroup.Text>
        <Form.Select
          value={filterOptions.role}
          onChange={(e) => setFilterOptions({ ...filterOptions, role: e.target.value })}
          style={{ width: 'auto' }}
        >
          <option value="all">All Roles</option>
          <option value="ROLE_USER">User</option>
          <option value="ROLE_ADMIN">Admin</option>
        </Form.Select>
      </InputGroup>

      <InputGroup style={{ width: 'auto' }}>
        <InputGroup.Text>Status</InputGroup.Text>
        <Form.Select
          value={filterOptions.status}
          onChange={(e) => setFilterOptions({ ...filterOptions, status: e.target.value })}
          style={{ width: 'auto' }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </Form.Select>
      </InputGroup>

      <InputGroup style={{ width: 'auto' }}>
        <InputGroup.Text>Registration Date</InputGroup.Text>
        <Form.Select
          value={filterOptions.dateRange}
          onChange={(e) => setFilterOptions({ ...filterOptions, dateRange: e.target.value })}
          style={{ width: 'auto' }}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </Form.Select>
      </InputGroup>

      <Button
        variant="outline-secondary"
        onClick={() => {
          setSearchTerm('');
          setFilterOptions({
            role: 'all',
            status: 'all',
            dateRange: 'all'
          });
        }}
      >
        Reset Filters
      </Button>
    </div>
  );
  
  // 编辑用户模态框
  const renderEditModal = () => (
    <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} onSubmit={handleEditUser}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={userForm.username}
              onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
              required
              disabled
            />
            <Form.Text className="text-muted">Username cannot be changed</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              required
            />
            <Form.Control.Feedback type="invalid">Please enter a valid email address</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              value={userForm.phone}
              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Leave blank to keep unchanged"
              value={userForm.password || ''}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            />
            <Form.Text className="text-muted">Only fill in if you want to change the password</Form.Text>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  required
                >
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={userForm.status}
                  onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={userForm.notes || ''}
              onChange={(e) => setUserForm({ ...userForm, notes: e.target.value })}
              placeholder="Add user notes..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );

  // 删除用户确认模态框
  const renderDeleteModal = () => (
    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <FaExclamationTriangle size={48} className="text-warning mb-3" />
          <h5>Are you sure you want to delete this user?</h5>
          <p className="text-muted">
            Username: {selectedUser?.username}<br />
            Email: {selectedUser?.email}
          </p>
          <Alert variant="danger">
            <strong>Warning:</strong> This operation cannot be undone. All data associated with this user will be permanently deleted.
          </Alert>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteUser}>
          Confirm Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
  
  return (  
    <Container fluid className="py-4">  
      <Row className="mb-4">  
        <Col>  
          <h2 className="mb-1">User Management</h2>  
          <p className="text-muted">View, add, edit, and delete user accounts</p>  
        </Col>  
        <Col xs="auto">  
          <Button variant="primary" onClick={() => setShowAddModal(true)}>  
            <FaUserPlus className="me-2" /> Create User  
          </Button>  
        </Col>  
      </Row>  
      
      {message.text && (  
        <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>  
          {message.text}  
        </Alert>  
      )}  
      
      <Card className="border-0 shadow-sm mb-4">  
        <Card.Body>  
          <div className="mb-3">
            <InputGroup className="mb-3">
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by username, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </Button>
              )}
            </InputGroup>
            {renderFilterOptions()}
          </div>

          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>#</th>
                  <th style={{ width: '15%' }}>Username</th>
                  <th style={{ width: '20%' }}>Email</th>
                  <th style={{ width: '15%' }}>Phone</th>
                  <th style={{ width: '10%' }}>Role</th>
                  <th style={{ width: '10%' }}>Status</th>
                  <th style={{ width: '15%' }}>Registration Date</th>
                  <th style={{ width: '10%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No matching users found
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => (
                    <tr key={user.username}>
                      <td>{indexOfFirstUser + index + 1}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <Badge bg={user.role === 'ROLE_ADMIN' ? 'danger' : 'info'}>
                          {getRoleDisplay(user.role)}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getStatusStyle(user.status)}>
                          {getStatusDisplay(user.status)}
                        </Badge>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openEditModal(user)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openDeleteModal(user)}
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
          
          {renderPagination()}
        </Card.Body>  
      </Card>  
      
      {/* 创建用户模态框 */}  
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>  
        <Modal.Header closeButton>  
          <Modal.Title>Create New User</Modal.Title>  
        </Modal.Header>  
        <Form noValidate validated={validated} onSubmit={handleAddUser}>  
          <Modal.Body>  
            <Form.Group className="mb-3">  
              <Form.Label>Username</Form.Label>  
              <Form.Control  
                type="text"  
                placeholder="Please enter username"  
                value={userForm.username}  
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}  
                required  
              />  
              <Form.Control.Feedback type="invalid">  
                Please enter username  
              </Form.Control.Feedback>  
            </Form.Group>  
            
            <Form.Group className="mb-3">  
              <Form.Label>Email</Form.Label>  
              <Form.Control  
                type="email"  
                placeholder="Please enter email"  
                value={userForm.email}  
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}  
                required  
              />  
              <Form.Control.Feedback type="invalid">  
                Please enter a valid email address  
              </Form.Control.Feedback>  
            </Form.Group>  
            
            <Form.Group className="mb-3">  
              <Form.Label>Phone</Form.Label>  
              <Form.Control  
                type="tel"  
                placeholder="Please enter phone number"  
                value={userForm.phone}  
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}  
              />  
              <Form.Control.Feedback type="invalid">  
                Please enter phone number  
              </Form.Control.Feedback>  
            </Form.Group>  

            <Form.Group className="mb-3">  
              <Form.Label>Password</Form.Label>  
              <Form.Control  
                type="password"  
                placeholder="Please enter password"  
                value={userForm.password || ''}  
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}  
                required  
              />  
              <Form.Control.Feedback type="invalid">  
                Please enter password  
              </Form.Control.Feedback>  
            </Form.Group>  
            
            <Row>  
              <Col md={6}>  
                <Form.Group className="mb-3">  
                  <Form.Label>Role</Form.Label>  
                  <Form.Select  
                    value={userForm.role}  
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}  
                    required  
                  >  
                    <option value="ROLE_USER">User</option>  
                    <option value="ROLE_ADMIN">Admin</option>  
                  </Form.Select>  
                </Form.Group>  
              </Col>  
              <Col md={6}>  
                <Form.Group className="mb-3">  
                  <Form.Label>Status</Form.Label>  
                  <Form.Select  
                    value={userForm.status}  
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}  
                    required  
                  >  
                    <option value="active">Active</option>  
                    <option value="inactive">Inactive</option>  
                    <option value="pending">Pending</option>  
                  </Form.Select>  
                </Form.Group>  
              </Col>  
            </Row>  
          </Modal.Body>  
          <Modal.Footer>  
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>  
              Cancel  
            </Button>  
            <Button variant="primary" type="submit">  
              Create  
            </Button>  
          </Modal.Footer>  
        </Form>  
      </Modal>  
      
      {/* 替换原有的模态框部分 */}
      {renderEditModal()}
      {renderDeleteModal()}
    </Container>  
  );  
};  

export default UserManagement;