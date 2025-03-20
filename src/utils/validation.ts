// Validation types and interfaces
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FieldValidation {
  required: boolean;
  maxLength?: number;
  validate: (value: string, rowData?: Record<string, string>) => ValidationResult;
}

// Validation functions
export const validateFirstName = (value: string): ValidationResult => {
  if (!value) return { isValid: false, error: 'First name is required' };
  if (value.length > 50) return { isValid: false, error: 'Maximum length is 50 characters' };
  
  const pattern = /^[A-Z][a-z]*$/;
  if (!pattern.test(value)) {
    return { 
      isValid: false, 
      error: 'Must start with uppercase letter followed by lowercase letters' 
    };
  }
  
  return { isValid: true };
};

export const validateFamilyName = (value: string): ValidationResult => {
  if (!value) return { isValid: false, error: 'Family name is required' };
  if (value.length > 50) return { isValid: false, error: 'Maximum length is 50 characters' };
  return { isValid: true };
};

export const validateEmail = (value: string): ValidationResult => {
  if (!value) return { isValid: false, error: 'Email is required' };
  if (value.length > 128) return { isValid: false, error: 'Maximum length is 128 characters' };
  
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(value)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
};

export const validateUnder16 = (value: string): ValidationResult => {
  if (!value) return { isValid: false, error: 'This field is required' };
  if (value !== '0' && value !== '1') {
    return { isValid: false, error: 'Must be either 0 or 1' };
  }
  return { isValid: true };
};

export const validatePassType = (value: string): ValidationResult => {
  if (!value) return { isValid: false, error: 'Pass type is required' };
  if (value !== 'P' && value !== 'D') {
    return { isValid: false, error: 'Must be either P (Permanent) or D (Day)' };
  }
  return { isValid: true };
};

export const validateAttribute = (value: string, passType: string): ValidationResult => {
  if (passType === 'P' && !value) {
    return { isValid: false, error: 'Attribute is required for permanent pass' };
  }
  
  if (value && !['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].includes(value)) {
    return { 
      isValid: false, 
      error: 'Must be one of: A (VIP), B (Official), C (Participant), D (Staff), E (Media), F (Organiser), G (Organiser Staff), H (Security), I (Medical), J (Volunteer)' 
    };
  }
  
  return { isValid: true };
};

export const validateOrganization = (value: string): ValidationResult => {
  if (!value) return { isValid: false, error: 'Organization name is required' };
  if (value.length > 50) return { isValid: false, error: 'Maximum length is 50 characters' };
  
  // No additional character restrictions - allow alphabetical, numeric, kanji, hiragana, katakana, and symbols
  return { isValid: true };
};

export const validateJobDescription = (value: string): ValidationResult => {
  if (!value) return { isValid: false, error: 'Job description is required' };
  if (value.length > 21) return { isValid: false, error: 'Maximum length is 21 characters' };
  
  const pattern = /^[A-Z0-9\s\-_]+$/;
  if (!pattern.test(value)) {
    return { isValid: false, error: 'Only uppercase letters, numbers, and symbols allowed' };
  }
  
  return { isValid: true };
};

export const validatePosition = (value: string): ValidationResult => {
  if (!value) return { isValid: false, error: 'Position is required' };
  if (value.length > 21) return { isValid: false, error: 'Maximum length is 21 characters' };
  
  const pattern = /^[A-Z0-9\s\-_]+$/;
  if (!pattern.test(value)) {
    return { isValid: false, error: 'Only uppercase letters, numbers, and symbols allowed' };
  }
  
  return { isValid: true };
};

export const validateAccessField = (value: string): ValidationResult => {
  if (!value) return { isValid: false, error: 'This field is required' };
  if (value !== '0' && value !== '1') {
    return { isValid: false, error: 'Must be either 0 or 1' };
  }
  return { isValid: true };
};

export const validateDate = (value: string): ValidationResult => {
  if (!value) return { isValid: true }; // Optional dates don't need validation
  
  const pattern = /^\d{4}\/\d{2}\/\d{2}$/;
  if (!pattern.test(value)) {
    return { isValid: false, error: 'Must be in YYYY/MM/DD format' };
  }
  
  const [year, month, day] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { isValid: false, error: 'Invalid date' };
  }
  
  return { isValid: true };
};

// Field validation configurations
export const fieldValidations: Record<string, FieldValidation> = {
  'First name': {
    required: true,
    maxLength: 50,
    validate: (value: string): ValidationResult => {
      if (!value) {
        return { isValid: false, error: 'First name is required' };
      }
      if (value.length > 50) {
        return { isValid: false, error: 'First name cannot exceed 50 characters' };
      }
      // Check if first letter is uppercase
      const firstLetter = value.match(/[a-zA-Z]/)?.[0];
      if (firstLetter && firstLetter !== firstLetter.toUpperCase()) {
        return { isValid: false, error: 'First name must start with an uppercase letter' };
      }
      return { isValid: true };
    }
  },
  'Family name': {
    required: true,
    maxLength: 50,
    validate: (value: string): ValidationResult => {
      if (!value) {
        return { isValid: false, error: 'Family name is required' };
      }
      if (value.length > 50) {
        return { isValid: false, error: 'Family name cannot exceed 50 characters' };
      }
      return { isValid: true };
    }
  },
  'Email address': {
    required: true,
    maxLength: 128,
    validate: (value: string): ValidationResult => {
      if (!value) {
        return { isValid: false, error: 'Email address is required' };
      }
      
      // Basic email validation regex
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
      
      return { isValid: true };
    }
  },
  'Under 16 years of age': {
    required: true,
    validate: validateUnder16
  },
  'Type of the AD Pass': {
    required: true,
    validate: validatePassType
  },
  'Attribute': {
    required: false,
    validate: (value: string, rowData?: Record<string, string>) => 
      validateAttribute(value, rowData?.['Type of the AD Pass'] || '')
  },
  'Name of division of group / name of subordinate organisation': {
    required: true,
    maxLength: 50,
    validate: (value: string): ValidationResult => {
      if (!value) {
        return { isValid: false, error: 'Organization name is required' };
      }
      if (value.length > 50) {
        return { isValid: false, error: 'Maximum length is 50 characters' };
      }
      // Allow alphabetical, numeric, kanji, hiragana, katakana, and symbols
      return { isValid: true };
    }
  },
  'Job category (job description)': {
    required: true,
    maxLength: 21,
    validate: (value: string): ValidationResult => {
      if (!value) {
        return { isValid: false, error: 'Job category (job description) is required' };
      }
      if (value.length > 21) {
        return { isValid: false, error: 'Job category (job description) cannot exceed 21 characters' };
      }
      return { isValid: true };
    }
  },
  'Job category (position)': {
    required: true,
    maxLength: 21,
    validate: validatePosition
  },
  'West Management Office (Operation Headquarters)': {
    required: true,
    validate: validateAccessField
  },
  'Media Centre': {
    required: true,
    validate: validateAccessField
  },
  'Guest House': {
    required: true,
    validate: validateAccessField
  },
  'EXPO Arena (backyard)': {
    required: true,
    validate: validateAccessField
  },
  'EXPO Hall (backyard)': {
    required: true,
    validate: validateAccessField
  },
  'EXPO National Day Hall (backyard)': {
    required: true,
    validate: validateAccessField
  }
};

// Add validation for all date fields
for (let i = 1; i <= 30; i++) {
  const startField = `Valid period${i.toString().padStart(2, '0')}(Start)`;
  const endField = `Valid period${i.toString().padStart(2, '0')}(End)`;
  
  fieldValidations[startField] = {
    required: i === 1,
    validate: validateDate
  };
  
  fieldValidations[endField] = {
    required: i === 1,
    validate: validateDate
  };
} 