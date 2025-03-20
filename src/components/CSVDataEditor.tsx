import { useState, useEffect } from 'react';
import { fieldValidations, ValidationResult } from '../utils/validation';
import CustomDateInput from './CustomDateInput';
import CSVExporter from './CSVExporter';
import ResetButton from './ResetButton';
import ErrorDetailsButton from './ErrorDetailsButton';

interface CSVDataEditorProps {
  data: any[];
  headers: string[];
  onDataChange: (newData: any[]) => void;
  resetData?: () => void;
}

// Predefined checkbox column patterns (any column containing these terms will be treated as a checkbox)
const CHECKBOX_PATTERNS = ['active', 'manager', 'remote', 'enabled', 'status'];

const ATTRIBUTE_OPTIONS = [
  { value: 'A', label: 'VIP guests (VIP)' },
  { value: 'B', label: 'Official participants (OFFICIAL PARTICIPANT)' },
  { value: 'C', label: 'Non-official participants (PARTICIPANT)' },
  { value: 'D', label: 'Management staff (STAFF)' },
  { value: 'E', label: 'Media representatives (MEDIA)' },
  { value: 'F', label: 'Organiser, Directors of Japan Association for the 2025 World Exposition (ORGANISER)' },
  { value: 'G', label: 'Staff of Japan Association for the 2025 World Exposition (ORGANISER STAFF)' },
  { value: 'H', label: 'Security staff (SECURITY)' },
  { value: 'I', label: 'Medical and first-aid staff (MEDICAL STAFF)' },
  { value: 'J', label: 'Volunteers (VOLUNTEER)' }
];

const PASS_TYPE_OPTIONS = [
  { value: 'P', label: 'Permanent pass' },
  { value: 'D', label: 'Day pass' }
];

const CSVDataEditor: React.FC<CSVDataEditorProps> = ({ data, headers, onDataChange, resetData }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [checkboxFields, setCheckboxFields] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
  
  // Comprehensive validation function for all fields
  const validateAllFields = (rowIndex: number) => {
    if (!data[rowIndex]) return false;
    
    const rowData = data[rowIndex];
    const newErrors: { [key: string]: string } = {};
    
    // Validate each field in the current row
    headers.forEach(field => {
      // Skip fields that don't need validation
      if (!fieldValidations[field]) return;
      
      const value = rowData[field] || '';
      let isValid = true;
      let errorMessage = '';
      
      // Special case for first name with hyphen
      if (field === 'First name') {
        if (value.includes('-')) {
          isValid = false;
          errorMessage = 'Hyphens are not allowed in names';
        } else if (value && value.match(/[a-zA-Z]/)?.[0]?.toLowerCase() === value.match(/[a-zA-Z]/)?.[0]) {
          isValid = false;
          errorMessage = 'First name must start with an uppercase letter';
        }
      }
      
      // Special case for job category uppercase
      if ((field === 'Job category (position)' || field === 'Job category (job description)') && 
          value && value !== value.toUpperCase()) {
        isValid = false;
        errorMessage = 'Job category must be in uppercase letters';
      }
      
      // Run standard validation if we haven't already found a specific error
      if (isValid && fieldValidations[field]) {
        const validation = fieldValidations[field].validate(value, rowData);
        isValid = validation.isValid;
        
        if (!isValid) {
          errorMessage = validation.error || 'Invalid input';
        }
      }
      
      // Only add an error entry if the field is invalid
      if (!isValid && errorMessage) {
        newErrors[field] = errorMessage;
      }
    });
    
    // Update validation state with all errors (or an empty object if all valid)
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Update validation when current row changes
  useEffect(() => {
    if (data.length > 0 && currentIndex < data.length) {
      validateAllFields(currentIndex);
    } else if (data.length === 0 && headers.length > 0) {
      // Create an empty row for validation when no data exists but headers are defined
      const emptyRow = headers.reduce((acc, header) => {
        const defaultValue = checkboxFields.has(header) ? "0" : "";
        return { ...acc, [header]: defaultValue };
      }, {});
      
      // Add this empty row to validate
      const tmpData: Record<string, any>[] = [emptyRow];
      
      // Validate the temporary empty row
      const rowData = tmpData[0];
      const newErrors: { [key: string]: string } = {};
      
      // Validate each field in the empty row
      headers.forEach(field => {
        // Skip fields that don't need validation
        if (!fieldValidations[field]) return;
        
        const value = rowData[field] || '';
        let isValid = true;
        let errorMessage = '';
        
        // Run standard validation
        if (fieldValidations[field]) {
          const validation = fieldValidations[field].validate(value, rowData);
          isValid = validation.isValid;
          
          if (!isValid) {
            errorMessage = validation.error || 'Invalid input';
          }
        }
        
        // Only add an error entry if the field is invalid
        if (!isValid && errorMessage) {
          newErrors[field] = errorMessage;
        }
      });
      
      // Update validation state with all errors
      setValidationErrors(newErrors);
    }
  }, [currentIndex, data, headers, checkboxFields]);
  
  // Identify checkbox fields based on both patterns and data values
  useEffect(() => {
    const identifiedCheckboxFields = new Set<string>();
    
    // First, check headers against predefined patterns
    headers.forEach(header => {
      const headerLower = header.toLowerCase();
      if (CHECKBOX_PATTERNS.some(pattern => headerLower.includes(pattern))) {
        identifiedCheckboxFields.add(header);
      }
    });

    // Add known checkbox fields regardless of data
    const knownCheckboxFields = [
      'West Management Office (Operation Headquarters)',
      'Media Centre',
      'Guest House',
      'EXPO Arena (backyard)',
      'EXPO Hall (backyard)',
      'EXPO National Day Hall (backyard)',
      'Under 16 years of age'
    ];
    
    knownCheckboxFields.forEach(field => {
      if (headers.includes(field)) {
        identifiedCheckboxFields.add(field);
      }
    });
    
    // Only check data patterns if we have enough rows to be confident
    // This prevents fields from becoming checkboxes just because they're empty
    if (data.length > 2) {
      headers.forEach(header => {
        if (!identifiedCheckboxFields.has(header)) {
          let isCheckboxCandidate = true;
          let hasValues = false; // Track if the field has any non-empty values
          
          // Check if all values for this header across all data are either "0", "1", 0, or 1
          for (const row of data) {
            const value = row[header];
            
            // Skip empty values in the determination
            if (value === "" || value === null || value === undefined) {
              continue;
            }
            
            hasValues = true;
            
            if (value !== "0" && value !== "1" && value !== 0 && value !== 1) {
              isCheckboxCandidate = false;
              break;
            }
          }
          
          // Only consider it a checkbox if we've seen actual values and they're all valid checkbox values
          if (isCheckboxCandidate && hasValues) {
            identifiedCheckboxFields.add(header);
          }
        }
      });
    }
    
    setCheckboxFields(identifiedCheckboxFields);
  }, [data, headers]);
  
  // Normalize checkbox values - replace empty strings with "0"
  useEffect(() => {
    // Check if we need to normalize the data
    let needsNormalization = false;
    const knownCheckboxFields = [
      'West Management Office (Operation Headquarters)',
      'Media Centre',
      'Guest House',
      'EXPO Arena (backyard)',
      'EXPO Hall (backyard)',
      'EXPO National Day Hall (backyard)',
      'Under 16 years of age'
    ];
    
    // If we have no data and we're creating a new CSV, create an empty row with defaults
    if (data.length === 0 && headers.length > 0) {
      const newRow = headers.reduce((acc, header) => {
        // Check if header is a checkbox field
        const isCheckboxField = checkboxFields.has(header) || 
                               knownCheckboxFields.includes(header);
        
        // Default to "0" for checkbox fields, empty string for others
        const defaultValue = isCheckboxField && headers.includes(header) ? "0" : "";
        return { ...acc, [header]: defaultValue };
      }, {});
      
      onDataChange([newRow]);
      return; // Early exit since we're creating a new row
    }
    
    const normalizedData = data.map(row => {
      const updatedRow = { ...row };
      let rowChanged = false;
      
      // Check both identified and known checkbox fields
      [...knownCheckboxFields, ...Array.from(checkboxFields)].forEach(field => {
        if (headers.includes(field) && 
            (updatedRow[field] === '' || updatedRow[field] === null || updatedRow[field] === undefined)) {
          updatedRow[field] = '0';
          rowChanged = true;
        }
      });
      
      if (rowChanged) {
        needsNormalization = true;
      }
      return updatedRow;
    });
    
    // Only update data if we actually made changes
    if (needsNormalization) {
      onDataChange(normalizedData);
    }
  }, [data, headers, checkboxFields, onDataChange]);
  
  useEffect(() => {
    if (data.length > 0 && currentIndex < data.length) {
      setFormData(data[currentIndex]);
    } else if (data.length === 0) {
      // Initialize with empty values for a new blank row
      const emptyRow = headers.reduce((acc, header) => {
        // Default to "0" for checkbox fields
        const defaultValue = checkboxFields.has(header) ? "0" : "";
        return { ...acc, [header]: defaultValue };
      }, {});
      setFormData(emptyRow);
    }
  }, [data, currentIndex, headers, checkboxFields]);
  
  const validateField = (value: string, header: string, rowData: any): ValidationResult => {
    const validation = fieldValidations[header];
    if (!validation) return { isValid: true };
    return validation.validate(value, rowData);
  };

  const handleInputChange = (rowIndex: number, field: string, value: string) => {
    // Update the data
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [field]: value };
    onDataChange(newData);
    
    // Validate the field that just changed
    const rowData = newData[rowIndex];
    let isValid = true;
    let errorMessage = '';
    
    // Special validation for field types
    if (field === 'First name') {
      if (value.includes('-')) {
        isValid = false;
        errorMessage = 'Hyphens are not allowed in names';
      } else if (value && value.match(/[a-zA-Z]/)?.[0]?.toLowerCase() === value.match(/[a-zA-Z]/)?.[0]) {
        isValid = false;
        errorMessage = 'First name must start with an uppercase letter';
      }
    }
    
    // Special case for job category uppercase
    if ((field === 'Job category (position)' || field === 'Job category (job description)') && 
        value && value !== value.toUpperCase()) {
      isValid = false;
      errorMessage = 'Job category must be in uppercase letters';
    }
    
    // Standard validation if we haven't found a specific error
    if (isValid && fieldValidations[field]) {
      const validation = fieldValidations[field].validate(value, rowData);
      isValid = validation.isValid;
      
      if (!isValid) {
        errorMessage = validation.error || 'Invalid input';
      }
    }
    
    // Update the validation error state
    setValidationErrors(prev => ({
      ...prev,
      [field]: isValid ? '' : errorMessage
    }));
    
    // Validate dependent fields (like Attribute depending on Pass Type)
    if (field === 'Type of the AD Pass' && rowData['Attribute']) {
      const attributeValidation = fieldValidations['Attribute']?.validate(rowData['Attribute'], rowData);
      if (attributeValidation) {
        setValidationErrors(prev => ({
          ...prev,
          'Attribute': attributeValidation.isValid ? '' : attributeValidation.error || 'Invalid input'
        }));
      }
    }
  };

  const handleDateValidationChange = (field: string, isValid: boolean, errorType?: string) => {
    setValidationErrors(prev => ({
      ...prev,
      [field]: isValid ? '' : errorType === 'required' ? 'Required field' : 'Invalid date format (YYYY/MM/DD)'
    }));
  };

  const handleCheckboxChange = (header: string, checked: boolean) => {
    const value = checked ? "1" : "0";
    const updatedFormData = { ...formData, [header]: value };
    setFormData(updatedFormData);
    
    // Update the data array with this change
    const updatedData = [...data];
    if (currentIndex < updatedData.length) {
      updatedData[currentIndex] = updatedFormData;
    } else {
      updatedData.push(updatedFormData);
    }
    onDataChange(updatedData);

    // Validate the field
    const validation = validateField(value, header, updatedFormData);
    setValidationErrors(prev => ({
      ...prev,
      [header]: validation.isValid ? '' : validation.error || 'Invalid input'
    }));
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleNext = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  // Helper function to determine if a value should be treated as checked
  const isValueChecked = (value: any): boolean => {
    return value === "1" || value === 1 || value === true || value === "true";
  };
  
  const handleAddNewRow = () => {
    // Check if current row has data (to prevent adding multiple empty rows)
    const isCurrentRowEmpty = Object.values(formData).every(
      value => value === '' || value === null || value === undefined || value === "0" || value === 0
    );
    
    if (data.length === 0 || !isCurrentRowEmpty) {
      // Create a new empty row
      const newRow = headers.reduce((acc, header) => {
        // Default to "0" for checkbox fields
        const defaultValue = checkboxFields.has(header) ? "0" : "";
        return { ...acc, [header]: defaultValue };
      }, {});
      
      // Add the new row to the data
      const newData = [...data, newRow];
      onDataChange(newData);
      
      // Move to the new row
      setCurrentIndex(newData.length - 1);
    }
  };
  
  const handleRemoveRow = () => {
    if (data.length === 0) return;
    
    // Ask for confirmation
    if (confirm('Are you sure you want to remove this row?')) {
      // Create a new array without the current row
      const updatedData = [...data];
      updatedData.splice(currentIndex, 1);
      
      // Update the data
      onDataChange(updatedData);
      
      // Adjust currentIndex if needed
      if (currentIndex >= updatedData.length && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
  };
  
  const renderField = (rowIndex: number, field: string, value: string) => {
    const error = validationErrors[field];
    // Create unique IDs for form fields by combining row index and field name
    const fieldId = `field-${rowIndex}-${field.replace(/[^a-zA-Z0-9]/g, '-')}`;
    
    const isCheckbox = field.includes('West Management Office') || 
                      field.includes('Media Centre') || 
                      field.includes('Guest House') || 
                      field.includes('EXPO Arena') || 
                      field.includes('EXPO Hall') || 
                      field.includes('EXPO National Day Hall') ||
                      field === 'Under 16 years of age';

    // Check if this field is the EXPO National Day Hall checkbox, to add subtitle after it
    const isExpoNationalDayHall = field === 'EXPO National Day Hall (backyard)';

    // Check if this is a valid period field
    const isStartDate = field.match(/^Valid period\d{2}\(Start\)$/);
    const isEndDate = field.match(/^Valid period\d{2}\(End\)$/);
    const periodNumber = isStartDate ? field.match(/Valid period(\d{2})/)?.[1] : 
                        isEndDate ? field.match(/Valid period(\d{2})/)?.[1] : null;

    // If this is a start date, render both start and end fields together
    if (isStartDate) {
      const startField = field;
      const endField = `Valid period${periodNumber}(End)`;
      const startValue = value;
      const endValue = data[rowIndex]?.[endField] || '';
      const startError = validationErrors[startField];
      const endError = validationErrors[endField];
      
      // Create unique IDs for start and end fields
      const startFieldId = `field-${rowIndex}-${startField.replace(/[^a-zA-Z0-9]/g, '-')}`;
      const endFieldId = `field-${rowIndex}-${endField.replace(/[^a-zA-Z0-9]/g, '-')}`;

      return (
        <div className="valid-period-group">
          <div className="valid-period-pair">
            <div className="form-group">
              <label htmlFor={startFieldId}>{startField}</label>
              <CustomDateInput
                id={startFieldId}
                value={startValue || ''}
                onChange={(newValue) => handleInputChange(rowIndex, startField, newValue)}
                className={startError ? 'error' : ''}
                required={periodNumber === '01'}
                onValidationChange={(isValid, errorType) => handleDateValidationChange(startField, isValid, errorType)}
              />
              {startError && <span className="error-message">{startError}</span>}
            </div>
            <div className="form-group">
              <label htmlFor={endFieldId}>{endField}</label>
              <CustomDateInput
                id={endFieldId}
                value={endValue || ''}
                onChange={(newValue) => handleInputChange(rowIndex, endField, newValue)}
                className={endError ? 'error' : ''}
                required={periodNumber === '01'}
                onValidationChange={(isValid, errorType) => handleDateValidationChange(endField, isValid, errorType)}
              />
              {endError && <span className="error-message">{endError}</span>}
            </div>
          </div>
        </div>
      );
    }

    // Skip rendering end date fields as they're handled with their start date pairs
    if (isEndDate) {
      return null;
    }

    // Add validation for Job category fields
    const isJobCategory = field === 'Job category (position)' || field === 'Job category (job description)';
    const isUppercase = isJobCategory ? value === value.toUpperCase() : true;
    const showUppercaseError = isJobCategory && value && !isUppercase;
    const jobCategoryValidation = isJobCategory ? fieldValidations[field].validate(value) : { isValid: true };
    const showJobCategoryError = isJobCategory && !jobCategoryValidation.isValid;

    // Add validation for First name field
    const isFirstName = field === 'First name';
    const hasHyphen = isFirstName && value?.includes('-');
    const showHyphenError = isFirstName && hasHyphen;
    
    // Check if the first letter is lowercase
    const firstLetter = value?.match(/[a-zA-Z]/)?.[0];
    const hasLowercaseFirst = isFirstName && 
                            !!value && 
                            value.trim() !== '' && 
                            !!firstLetter && 
                            firstLetter.toLowerCase() === firstLetter && 
                            firstLetter.toUpperCase() !== firstLetter;

    // Add email validation
    const isEmail = field === 'Email address';
    const emailValidation = isEmail ? fieldValidations[field].validate(value) : { isValid: true };
    const showEmailError = isEmail && !emailValidation.isValid;

    // Add validation for Family name field
    const isFamilyName = field === 'Family name';
    const familyNameValidation = isFamilyName ? fieldValidations[field].validate(value) : { isValid: true };
    const showFamilyNameError = isFamilyName && !familyNameValidation.isValid;

    // Add validation for Organization name field
    const isOrgName = field === 'Name of division of group / name of subordinate organisation';
    const orgNameValidation = isOrgName ? fieldValidations[field].validate(value) : { isValid: true };
    const showOrgNameError = isOrgName && !orgNameValidation.isValid;

    if (field === 'Type of the AD Pass') {
      return (
        <div className="form-group select-group">
          <label htmlFor={fieldId}>{field}</label>
          <select
            id={fieldId}
            value={value || ''}
            onChange={(e) => handleInputChange(rowIndex, field, e.target.value)}
            className={error ? 'error' : ''}
          >
            <option value="">Select pass type</option>
            {PASS_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.value} - {option.label}
              </option>
            ))}
          </select>
          {error && <span className="error-message">{error}</span>}
        </div>
      );
    }

    if (field === 'Attribute') {
      const passType = data[rowIndex]?.['Type of the AD Pass'];
      const isDisabled = passType !== 'P';
      
      return (
        <div className="form-group select-group">
          <label htmlFor={fieldId}>{field}</label>
          <select
            id={fieldId}
            value={value || ''}
            onChange={(e) => handleInputChange(rowIndex, field, e.target.value)}
            disabled={isDisabled}
            className={error ? 'error' : ''}
          >
            <option value="">Select an attribute</option>
            {ATTRIBUTE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.value} - {option.label}
              </option>
            ))}
          </select>
          {isDisabled && (
            <span className="helper-text">Attribute is only required for permanent pass (P)</span>
          )}
          {error && <span className="error-message">{error}</span>}
        </div>
      );
    }

    if (isCheckbox) {
      // Check if this is the first checkbox in the access requirements section
      const isFirstAccessRequirement = field === 'West Management Office (Operation Headquarters)';
      
      return (
        <>
          {isFirstAccessRequirement && (
            <h3 className="access-requirements-subtitle">Access Requirements</h3>
          )}
          <div className="form-group checkbox-field">
            <div className="checkbox-container">
              <input
                id={fieldId}
                type="checkbox"
                checked={isValueChecked(value)}
                onChange={(e) => handleCheckboxChange(field, e.target.checked)}
              />
              <label htmlFor={fieldId}>{field}</label>
            </div>
            {error && <span className="error-message">{error}</span>}
          </div>
          {isExpoNationalDayHall && (
            <h3 id="valid-period-subtitle">Valid Periods</h3>
          )}
        </>
      );
    }

    if (isJobCategory) {
      const maxLength = field === 'Job category (job description)' ? 21 : 21;
      const charCount = value ? value.length : 0;
      const charCountClass = charCount >= maxLength ? 'error' : charCount >= (maxLength * 0.8) ? 'warning' : '';
      
      return (
        <div className="form-group">
          <label htmlFor={fieldId}>
            {field} <span className={`character-count ${charCountClass}`}>{charCount}/{maxLength}</span>
          </label>
          <div className="input-with-button">
            <input
              id={fieldId}
              type="text"
              value={value || ''}
              onChange={(e) => handleInputChange(rowIndex, field, e.target.value)}
              className={showUppercaseError || showJobCategoryError ? 'error' : ''}
              maxLength={maxLength}
            />
            {showUppercaseError && (
              <button
                type="button"
                className="transform-btn"
                onClick={() => handleInputChange(rowIndex, field, value.toUpperCase())}
              >
                To Uppercase
              </button>
            )}
          </div>
          {showUppercaseError && (
            <span className="error-message">Job category must be in uppercase letters</span>
          )}
          {showJobCategoryError && !showUppercaseError && (
            <span className="error-message">{jobCategoryValidation.error}</span>
          )}
        </div>
      );
    }

    if (isFirstName) {
      const charCount = value ? value.length : 0;
      const charCountClass = charCount >= 50 ? 'error' : charCount >= 40 ? 'warning' : '';
      const hasError = !!validationErrors[field] || showHyphenError || hasLowercaseFirst;
      
      return (
        <div className="form-group">
          <label htmlFor={fieldId}>
            {field} <span className={`character-count ${charCountClass}`}>{charCount}/50</span>
          </label>
          <div className="input-with-button">
            <input
              id={fieldId}
              type="text"
              value={value || ''}
              onChange={(e) => handleInputChange(rowIndex, field, e.target.value)}
              className={hasError ? 'error' : ''}
              maxLength={50}
            />
            {showHyphenError && (
              <button
                type="button"
                className="transform-btn"
                onClick={() => handleInputChange(rowIndex, field, value.replace(/-/g, '‐'))}
              >
                Fix Hyphen
              </button>
            )}
            {hasLowercaseFirst && (
              <button
                type="button"
                className="transform-btn"
                onClick={() => {
                  const firstLetter = value.match(/[a-zA-Z]/)?.[0];
                  if (firstLetter) {
                    const newValue = value.replace(/^[a-zA-Z]/, firstLetter.toUpperCase());
                    handleInputChange(rowIndex, field, newValue);
                  }
                }}
              >
                Capitalize First Letter
              </button>
            )}
          </div>
          {showHyphenError && (
            <span className="error-message">Hyphens are not allowed in names. Click the button to use a compatible character.</span>
          )}
          {hasLowercaseFirst && !showHyphenError && (
            <span className="error-message">First name must start with an uppercase letter</span>
          )}
          {validationErrors[field] && !showHyphenError && !hasLowercaseFirst && (
            <span className="error-message">{validationErrors[field]}</span>
          )}
        </div>
      );
    }

    if (isEmail) {
      const maxLength = 128;
      const charCount = value ? value.length : 0;
      const charCountClass = charCount >= maxLength ? 'error' : charCount >= 100 ? 'warning' : '';
      
      return (
        <div className="form-group">
          <label htmlFor={fieldId}>
            {field} <span className={`character-count ${charCountClass}`}>{charCount}/{maxLength}</span>
          </label>
          <input
            id={fieldId}
            type="email"
            value={value || ''}
            onChange={(e) => handleInputChange(rowIndex, field, e.target.value)}
            className={showEmailError ? 'error' : ''}
            maxLength={maxLength}
          />
          {showEmailError && (
            <span className="error-message">{emailValidation.error}</span>
          )}
        </div>
      );
    }

    if (isFamilyName) {
      const charCount = value ? value.length : 0;
      const charCountClass = charCount >= 50 ? 'error' : charCount >= 40 ? 'warning' : '';
      
      return (
        <div className="form-group">
          <label htmlFor={fieldId}>
            {field} <span className={`character-count ${charCountClass}`}>{charCount}/50</span>
          </label>
          <div className="input-with-button">
            <input
              id={fieldId}
              type="text"
              value={value || ''}
              onChange={(e) => handleInputChange(rowIndex, field, e.target.value)}
              className={showFamilyNameError ? 'error' : ''}
              maxLength={50}
            />
            <button
              type="button"
              className="transform-btn"
              onClick={() => handleInputChange(rowIndex, field, value.toUpperCase())}
            >
              To Uppercase
            </button>
          </div>
          {showFamilyNameError && (
            <span className="error-message">{familyNameValidation.error}</span>
          )}
        </div>
      );
    }

    if (isOrgName) {
      const charCount = value ? value.length : 0;
      const charCountClass = charCount >= 50 ? 'error' : charCount >= 40 ? 'warning' : '';
      
      return (
        <div className="form-group">
          <label htmlFor={fieldId}>
            {field} <span className={`character-count ${charCountClass}`}>{charCount}/50</span>
          </label>
          <input
            id={fieldId}
            type="text"
            value={value || ''}
            onChange={(e) => handleInputChange(rowIndex, field, e.target.value)}
            className={showOrgNameError ? 'error' : ''}
            maxLength={50}
          />
          {showOrgNameError && (
            <span className="error-message">{orgNameValidation.error}</span>
          )}
        </div>
      );
    }

    return (
      <div className="form-group">
        <label htmlFor={fieldId}>{field}</label>
        <input
          id={fieldId}
          type="text"
          value={value || ''}
          onChange={(e) => handleInputChange(rowIndex, field, e.target.value)}
          maxLength={fieldValidations[field]?.maxLength}
        />
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  };
  
  // Component for the error details popup
  const ErrorPopup = () => {
    if (!showErrorPopup) return null;
    
    const errorEntries = Object.entries(validationErrors)
      .filter(([_, errorMessage]) => errorMessage !== '')
      .map(([field, errorMessage]) => ({
        field,
        value: data[currentIndex]?.[field] || '',
        error: errorMessage
      }));
    
    if (errorEntries.length === 0) return null;
    
    return (
      <div className="error-popup">
        <div className="error-popup-content">
          <div className="error-popup-header">
            <h3>Validation Errors</h3>
            <button className="close-button" onClick={() => setShowErrorPopup(false)}>×</button>
          </div>
          <div className="error-popup-body">
            <table className="error-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {errorEntries.map(({ field, value, error }, index) => (
                  <tr key={index}>
                    <td>{field}</td>
                    <td>{value}</td>
                    <td>{error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      <div className="csv-data-editor">
      <h2>Edit Data</h2>
      <div className="row-indicator">
        {data.length === 0 
          ? 'No rows yet' 
          : `Row ${currentIndex + 1} of ${data.length}`}
      </div>
      <div className="navigation">
      <ResetButton onClick={resetData} />
        <div className="navigation-buttons">
          <button title="Previous Row" className="pale-blue-btn" onClick={handlePrevious} disabled={currentIndex === 0 || data.length === 0}>
          <span className="navigation-button-icon">⏴</span>
          </button>
          <button title="Next Row" className="pale-blue-btn" onClick={handleNext} disabled={currentIndex === data.length - 1 || data.length === 0}>
          <span className="navigation-button-icon">⏵</span>
          </button>
          <button className="pale-blue-btn" onClick={handleAddNewRow} title="Add Row">
          <span className="navigation-button-icon">➕</span>
          </button>
          <button 
            onClick={handleRemoveRow} 
            className="pale-blue-btn"
            disabled={data.length === 0}
            title="Remove Row"
          >
            <span className="navigation-button-icon remove-icon">🗑</span>
          </button>
        </div>
      </div>
      <div className="validation-wrapper">
        <div className={`validation-status ${Object.values(validationErrors).some(error => error !== '') ? 'invalid' : 'valid'}`}>
          {Object.values(validationErrors).some(error => error !== '') 
            ? `Validation errors: ${Object.values(validationErrors).filter(error => error !== '').length}` 
            : '✓ All validations pass'}
            {Object.values(validationErrors).some(error => error !== '') && (
          <ErrorDetailsButton onClick={() => setShowErrorPopup(true)}/>
        )}
        </div>
        
      </div>
      <ErrorPopup />
      <form className="data-form">
        {headers.map((header) => {
          const field = renderField(currentIndex, header, data[currentIndex]?.[header] || '');
          return field ? <div key={header}>{field}</div> : null;
        })}
      </form>
    </div>
      <div className="header-actions floating">
        <CSVExporter data={data} headers={headers} />
      </div>
    </>
  );
};

export default CSVDataEditor; 