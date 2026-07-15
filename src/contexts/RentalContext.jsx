import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import rentalService from '../services/rental.service';

export const RentalContext = createContext(null);

export const useRental = () => {
  const context = useContext(RentalContext);
  if (!context) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
};

export const RentalProvider = ({ children }) => {
  const [currentRental, setCurrentRental] = useState(null);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { currentUser, isAuthenticated } = useAuth();

  const loadUserRentals = useCallback(async () => {
    if (!isAuthenticated || !currentUser?.username) {
      setRentals([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userRentals = await rentalService.getUserRentals(currentUser.username);
      setRentals(userRentals);
      
      // Update current rental if exists
      const activeRental = userRentals.find(rental => rental.status === 'ACTIVE');
      if (activeRental) {
        setCurrentRental(activeRental);
      }
    } catch (err) {
      console.error('Failed to load rentals:', err);
      setError(err.message);
      setRentals([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.username, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && currentUser?.username) {
      loadUserRentals();
    } else {
      setRentals([]);
      setCurrentRental(null);
      setError(null);
    }
  }, [isAuthenticated, currentUser?.username, loadUserRentals]);

  const addRental = useCallback((rental) => {
    if (!rental) return;

    setRentals(prevRentals => {
      // Check if rental already exists
      const exists = prevRentals.some(r => r.id === rental.id);
      if (exists) {
        // Update existing rental
        return prevRentals.map(r => r.id === rental.id ? rental : r);
      }
      // Add new rental
      return [rental, ...prevRentals];
    });
    setCurrentRental(rental);
  }, []);

  const endRental = async (rentalId) => {
    if (!currentUser?.username) {
      throw new Error('请先登录后再操作');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await rentalService.endRental(rentalId);
      setCurrentRental(null);
      await loadUserRentals();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const extendRental = async (rentalId, duration) => {
    if (!currentUser?.username) {
      throw new Error('请先登录后再操作');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await rentalService.extendRental(rentalId, duration);
      await loadUserRentals();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelRental = async (rentalId) => {
    if (!currentUser?.username) {
      throw new Error('请先登录后再操作');
    }

    try {
      setLoading(true);
      setError(null);
      const result = await rentalService.cancelRental(rentalId);
      setCurrentRental(null);
      await loadUserRentals();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    currentRental,
    rentals,
    loading,
    error,
    endRental,
    extendRental,
    cancelRental,
    loadUserRentals,
    addRental,
    clearError
  };

  return (
    <RentalContext.Provider value={value}>
      {children}
    </RentalContext.Provider>
  );
};

export default RentalProvider;