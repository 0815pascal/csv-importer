import React, { useState, useEffect, useRef } from 'react';

interface CustomDateInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
  onValidationChange?: (isValid: boolean, errorType?: string) => void;
}

const CustomDateInput: React.FC<CustomDateInputProps> = ({
  id,
  value,
  onChange,
  className = '',
  required = false,
  onValidationChange
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isValid, setIsValid] = useState(true);
  // Use ref to store the latest callback
  const onValidationChangeRef = useRef(onValidationChange);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update the ref when the callback changes
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // Validate date format
  useEffect(() => {
    let newIsValid = true;
    let newErrorType = '';
    
    if (!displayValue || displayValue.trim() === '') {
      // Empty value is only invalid if required
      if (required) {
        newIsValid = false;
        newErrorType = 'required';
      }
    } else {
      // Only validate format if there's actual content
      const isValidFormat = /^\d{4}\/\d{2}\/\d{2}$/.test(displayValue);
      
      if (!isValidFormat) {
        newIsValid = false;
        newErrorType = 'format';
      } else {
        // Validate the date is a real date
        const [year, month, day] = displayValue.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        if (!(date.getFullYear() === year &&
              date.getMonth() === month - 1 &&
              date.getDate() === day)) {
          newIsValid = false;
          newErrorType = 'format';
        }
      }
    }
    
    setIsValid(newIsValid);
    
    // Call the current callback from ref with the error type
    if (onValidationChangeRef.current) {
      onValidationChangeRef.current(newIsValid, newErrorType);
    }
  }, [displayValue, required]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    // Remove any non-digit and non-slash characters
    newValue = newValue.replace(/[^\d/]/g, '');
    
    // Remove extra slashes if user types them
    if (newValue.match(/\/{2,}/)) {
      newValue = newValue.replace(/\/{2,}/g, '/');
    }
    
    // Format as user types
    if (newValue.length > 0) {
      // Just the digits without slashes
      const digits = newValue.replace(/\//g, '');
      
      // Auto-format with slashes
      if (digits.length > 0) {
        let formattedValue = '';
        let newCursorPosition = cursorPosition;
        
        // Year (first 4 digits)
        if (digits.length <= 4) {
          formattedValue = digits;
          
          // Add slash automatically when year is complete (4 digits)
          if (digits.length === 4) {
            formattedValue += '/';
            // If user just typed the 4th digit, move cursor after the slash
            if (cursorPosition === 4) {
              newCursorPosition = 5;
            }
          }
        } else {
          // Year is complete, add it with slash
          formattedValue = digits.substring(0, 4) + '/';
          
          // Month (next 2 digits)
          const monthDigits = digits.substring(4, Math.min(6, digits.length));
          formattedValue += monthDigits;
          
          // Add slash automatically when month is complete (2 digits)
          if (monthDigits.length === 2 && digits.length >= 6) {
            formattedValue += '/';
            // If user just typed the 6th digit (2nd of month), move cursor after slash
            if (cursorPosition === 6 || cursorPosition === 7) {
              newCursorPosition = 8;
            }
          }
          
          // Day (final 2 digits)
          if (digits.length > 6) {
            formattedValue += digits.substring(6, Math.min(8, digits.length));
          }
        }
        
        newValue = formattedValue;
        
        // Set cursor position after update
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = newCursorPosition;
            inputRef.current.selectionEnd = newCursorPosition;
          }
        }, 0);
      }
    }
    
    setDisplayValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="date-input-container">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        pattern="\d{4}/\d{2}/\d{2}"
        placeholder="YYYY/MM/DD"
        className={`${className} ${!isValid ? 'error' : ''}`}
        required={required}
      />
    </div>
  );
};

export default CustomDateInput; 