/**  
 * Validation functions for the scooter rental application  
 */  

// Email validation  
export const validateEmail = (email) => {  
  // 使用更简单的邮箱验证规则
  if (!email) return 'Please enter your email address';
  
  // 只要包含@和.就认为是有效的邮箱
  if (email.includes('@') && email.includes('.')) {
    return null;
  }
  
  return 'Please enter a valid email address';  
};  
  
// Password validation - at least 6 characters
export const validatePassword = (password) => {
  if (!password) return 'Please enter your password.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
};

// Phone number validation (US format for demo)
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') return null;
  // US phone regex for demo
  const regex = /^\d{10}$/;
  if (!regex.test(phone)) return 'Please enter a valid phone number.';
  return null;
};

// Name validation
export const validateName = (name) => {
  if (!name) return 'Please enter your name.';
  if (name.length < 2) return 'Name must be at least 2 characters.';
  return null;
};

// ID Card validation (generic)
export const validateIdCard = (idCard) => {
  if (!idCard) return 'Please enter your ID card number.';
  if (!/^\w{6,}$/.test(idCard)) return 'Please enter a valid ID card number.';
  return null;
};

// Credit card number validation
export const validateCardNumber = (cardNumber) => {
  const number = cardNumber.replace(/\s+/g, '');
  if (!number) return 'Please enter your card number.';
  if (!/^\d{13,19}$/.test(number)) return 'Please enter a valid card number.';
  // Luhn algorithm for card number validation
  let sum = 0;
  let shouldDouble = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number.charAt(i));
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return (sum % 10) === 0 ? null : 'Please enter a valid card number.';
};

// Credit card CVV validation
export const validateCVV = (cvv) => {
  if (!cvv) return 'Please enter the CVV.';
  if (!/^\d{3,4}$/.test(cvv)) return 'Please enter a valid CVV.';
  return null;
};

// Credit card expiry date validation (MM/YY format)  
export const validateExpiry = (expiry) => {  
  if (!expiry) return 'Please enter the expiry date';  
  
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;  
  if (!regex.test(expiry)) return 'Please use MM/YY format';  
  
  const [month, year] = expiry.split('/');  
  const currentDate = new Date();  
  const currentYear = currentDate.getFullYear() % 100;  
  const currentMonth = currentDate.getMonth() + 1;  
  
  const expiryMonth = parseInt(month, 10);  
  const expiryYear = parseInt(year, 10);  
  
  if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {  
    return 'Card has expired';  
  }  
  
  return null;  
};  
  
// Date validation for future dates  
export const validateFutureDate = (dateString) => {  
  if (!dateString) return 'Please select a date';  
  
  const selectedDate = new Date(dateString);  
  const currentDate = new Date();  
  
  // Remove time part for comparison  
  currentDate.setHours(0, 0, 0, 0);  
  
  if (selectedDate < currentDate) {  
    return 'Please select a future date';  
  }  
  
  return null;  
};  
  
// Rental duration validation (minimum duration)
export const validateRentalDuration = (durationInMinutes, minimumDuration = 15) => {
  if (!durationInMinutes) return 'Please enter the rental duration.';
  if (isNaN(durationInMinutes)) return 'Please enter a valid rental duration.';
  if (durationInMinutes < minimumDuration) {
    return `Minimum rental duration is ${minimumDuration} minutes.`;
  }
  return null;
};

// Validate scooter battery level for rental  
export const validateBatteryForRental = (batteryLevel, rentalDurationInMinutes) => {  
  // Assume scooter can run for 120 minutes on 100% battery  
  const estimatedRange = batteryLevel * 1.2;  
  
  // Add 15 minute buffer  
  if (estimatedRange < rentalDurationInMinutes + 15) {  
    return 'Battery level insufficient for this rental, please choose another scooter';  
  }  
  
  return null;  
};  
  
// Validate form inputs  
export const validateForm = (formData, validationRules) => {  
  const errors = {};  
  let isValid = true;  
  
  Object.keys(validationRules).forEach(field => {  
    const value = formData[field];  
    const validationFunction = validationRules[field];  
    
    // If validation function is an array, run all functions  
    if (Array.isArray(validationFunction)) {  
      for (const func of validationFunction) {  
        const error = func(value, formData);  
        if (error) {  
          errors[field] = error;  
          isValid = false;  
          break;  
        }  
      }  
    } else {  
      // Run single validation function  
      const error = validationFunction(value, formData);  
      if (error) {  
        errors[field] = error;  
        isValid = false;  
      }  
    }  
  });  
  
  return { isValid, errors };  
};