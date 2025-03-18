import { useState, useEffect } from 'react';

interface CSVDataEditorProps {
  data: any[];
  headers: string[];
  onDataChange: (newData: any[]) => void;
}

// Predefined checkbox column patterns (any column containing these terms will be treated as a checkbox)
const CHECKBOX_PATTERNS = ['active', 'manager', 'remote', 'enabled', 'status'];

const CSVDataEditor = ({ data, headers, onDataChange }: CSVDataEditorProps) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [checkboxFields, setCheckboxFields] = useState<Set<string>>(new Set());
  
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
  
  const handleInputChange = (header: string, value: string) => {
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
  
  return (
    <div className="csv-data-editor">
      <h2>Edit Data</h2>
      <div className="navigation">
        <span>
          {data.length === 0 
            ? 'No rows yet' 
            : `Row ${currentIndex + 1} of ${data.length}`}
        </span>
        <div className="navigation-buttons">
          <button onClick={handlePrevious} disabled={currentIndex === 0 || data.length === 0}>
            Previous
          </button>
          <button onClick={handleNext} disabled={currentIndex === data.length - 1 || data.length === 0}>
            Next
          </button>
          <button onClick={handleAddNewRow} className="add-row-btn">
            Add Row
          </button>
          <button 
            onClick={handleRemoveRow} 
            className="remove-row-btn"
            disabled={data.length === 0}
          >
            Remove Row
          </button>
        </div>
      </div>
      
      <form className="data-form">
        {headers.map((header) => {
          // Check if this field should be rendered as a checkbox
          if (checkboxFields.has(header)) {
            return (
              <div key={header} className="form-group checkbox-field">
                <div className="checkbox-container">
                  <input
                    id={header}
                    type="checkbox"
                    checked={isValueChecked(formData[header])}
                    onChange={(e) => handleCheckboxChange(header, e.target.checked)}
                  />
                  <label htmlFor={header}>{header}</label>
                </div>
              </div>
            );
          }
          
          // Standard text input for non-checkbox fields
          return (
            <div key={header} className="form-group">
              <label htmlFor={header}>{header}</label>
              <input
                id={header}
                type="text"
                value={formData[header] || ''}
                onChange={(e) => handleInputChange(header, e.target.value)}
              />
            </div>
          );
        })}
      </form>
    </div>
  );
};

export default CSVDataEditor; 