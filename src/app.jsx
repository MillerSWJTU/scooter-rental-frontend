import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import About from './components/About';
import ScooterList from './components/scooters/ScooterList';
import ScooterDetails from './components/scooters/ScooterDetails';
import RentalForm from './components/scooters/RentalForm';
import RentalHistory from './components/rentals/RentalHistory';
import RentalManagement from './components/rentals/RentalManagement';
import PrivateRoute from './components/auth/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { RentalProvider } from './contexts/RentalContext';
import Layout from './components/Layout';
import Profile from './components/user/Profile';

// Admin Components
import Dashboard from './components/admin/Dashboard';
import UserManagement from './components/admin/UserManagement';
import ScooterManagement from './components/admin/ScooterManagement';
import FeedbackManagement from './components/admin/FeedbackManagement';

// FeedBack Components
import FeedbackForm from './components/feedback/FeedbackForm';
import FeedbackPage from './components/feedback/FeedbackPage';

// Payment Components
import PaymentForm from './components/payments/PaymentForm';
import PaymentResult from './components/payments/PaymentResult';

function App() {
  return (
    <AuthProvider>
      <RentalProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />

            {/* User Routes */}
            <Route
              path="/scooters"
              element={
                <PrivateRoute>
                  <ScooterList />
                </PrivateRoute>
              }
            />
            <Route
              path="/scooters/:id"
              element={
                <PrivateRoute>
                  <ScooterDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/scooters/:id/rent"
              element={
                <PrivateRoute>
                  <RentalForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/rentals"
              element={
                <PrivateRoute>
                  <RentalHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/rentals/manage"
              element={
                <PrivateRoute>
                  <RentalManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            
            {/* Payment Routes */}
            <Route
              path="/rentals/:rentalId/payment"
              element={
                <PrivateRoute>
                  <PaymentForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/payments/:paymentId/result"
              element={
                <PrivateRoute>
                  <PaymentResult />
                </PrivateRoute>
              }
            />
            <Route
              path="/payments/callback"
              element={<PaymentResult />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute requireAdmin>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute requireAdmin>
                  <UserManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/scooters"
              element={
                <PrivateRoute requireAdmin>
                  <ScooterManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/feedbacks"
              element={
                <PrivateRoute requireAdmin>
                  <FeedbackManagement />
                </PrivateRoute>
              }
            />

            {/* feedback Routes */}
            <Route
              path="/feedback"
              element={
                <PrivateRoute>
                  <FeedbackPage />
                </PrivateRoute>
              }
            />
            <Route path="/feedback-form" element={<FeedbackForm />} />

          </Routes>
        </Layout>
      </RentalProvider>
    </AuthProvider>
  );
}

export default App;