import React from 'react';  
import { Routes, Route, Navigate } from 'react-router-dom';  
import { useAuth } from './contexts/AuthContext';  

// Common Components  
import ProtectedRoute from './components/common/ProtectedRoute';  
import Map from './components/common/Map';  

// User Components  
import Login from './components/user/login';  
import Register from './components/user/Register';  
import Profile from './components/user/Profile';  
import PaymentInfo from './components/user/PaymentInfo';  

// Scooter Components  
import ScooterList from './components/scooters/ScooterList';  
import ScooterDetails from './components/scooters/ScooterDetails';  
import RentalForm from './components/scooters/RentalForm';  
import RentalHistory from './components/scooters/RentalHistory';  

// Admin Components  
import Dashboard from './components/admin/Dashboard';  
import UserManagement from './components/admin/UserManagement';  
import ScooterManagement from './components/admin/ScooterManagement';  
import IssuesList from './components/admin/IssuesList';  
import PricingSettings from './components/admin/PricingSettings';  

const AppRoutes = () => {  
  const { isAuthenticated, isAdmin } = useAuth();  

  return (  
    <Routes>  
      {/* Public Routes */}  
      <Route   
        path="/login"   
        element={  
          isAuthenticated ? (  
            <Navigate to={isAdmin ? "/admin/dashboard" : "/scooters"} replace />  
          ) : (  
            <Login />  
          )  
        }   
      />  
      <Route   
        path="/register"   
        element={  
          isAuthenticated ? (  
            <Navigate to={isAdmin ? "/admin/dashboard" : "/scooters"} replace />  
          ) : (  
            <Register />  
          )  
        }   
      />  
      <Route path="/map" element={<Map />} />  
      
      {/* Protected Routes */}  
      <Route   
        path="/scooters"   
        element={  
          <ProtectedRoute>  
            <ScooterList />  
          </ProtectedRoute>  
        }   
      />  
      <Route   
        path="/profile"   
        element={  
          <ProtectedRoute>  
            <Profile />  
          </ProtectedRoute>  
        }   
      />  
      <Route   
        path="/payment"   
        element={  
          <ProtectedRoute>  
            <PaymentInfo />  
          </ProtectedRoute>  
        }   
      />  
      <Route   
        path="/scooters/:id"   
        element={  
          <ProtectedRoute>  
            <ScooterDetails />  
          </ProtectedRoute>  
        }   
      />  
      <Route   
        path="/scooters/:id/rent"   
        element={  
          <ProtectedRoute>  
            <RentalForm />  
          </ProtectedRoute>  
        }   
      />  
      <Route   
        path="/rentals"   
        element={  
          <ProtectedRoute>  
            <RentalHistory />  
          </ProtectedRoute>  
        }   
      />  
      
      {/* Admin Routes */}  
      <Route   
        path="/admin/dashboard"   
        element={  
          <ProtectedRoute requireAdmin>  
            <Dashboard />  
          </ProtectedRoute>  
        }   
      />  
      <Route   
        path="/admin/users"   
        element={  
          <ProtectedRoute requireAdmin>  
            <UserManagement />  
          </ProtectedRoute>  
        }   
      />  
      <Route   
        path="/admin/scooters"   
        element={  
          <ProtectedRoute requireAdmin>  
            <ScooterManagement />  
          </ProtectedRoute>  
        }   
      />  
      <Route   
        path="/admin/issues"   
        element={  
          <ProtectedRoute requireAdmin>  
            <IssuesList />  
          </ProtectedRoute>  
        }   
      />  
      <Route   
        path="/admin/pricing"   
        element={  
          <ProtectedRoute requireAdmin>  
            <PricingSettings />  
          </ProtectedRoute>  
        }   
      />  
      
      {/* Default Route */}  
      <Route   
        path="/"   
        element={  
          <Navigate   
            to={  
              isAuthenticated   
                ? isAdmin   
                  ? "/admin/dashboard"   
                  : "/scooters"   
                : "/login"   
            }   
            replace   
          />   
        }   
      />  
      
      {/* 404 Route */}  
      <Route path="*" element={<Navigate to="/" replace />} />  
    </Routes>  
  );  
};

export default AppRoutes;