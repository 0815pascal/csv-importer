import { useState, useRef, ChangeEvent } from 'react';
import Papa from 'papaparse';

interface CSVImporterProps {
  onDataImported: (data: any[], headers: string[]) => void;
}

const CSVImporter = ({ onDataImported }: CSVImporterProps) => {
  const [fileName, setFileName] = useState<string>('');
  const [delimiter, setDelimiter] = useState<string>(',');
  const [customDelimiter, setCustomDelimiter] = useState<string>('');
  const [replaceSemicolons, setReplaceSemicolons] = useState<boolean>(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      let csvContent = event.target.result as string;
      
      // Apply character replacements if enabled
      if (replaceSemicolons) {
        csvContent = csvContent.replace(/;/g, ',');
      }
      
      // Use the selected delimiter or custom delimiter
      const actualDelimiter = delimiter === 'custom' ? customDelimiter : delimiter;
      
      Papa.parse(csvContent, {
        header: true,
        delimiter: actualDelimiter,
        complete: (results) => {
          const data = results.data;
          const headers = results.meta.fields || [];
          onDataImported(data, headers);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file. Please ensure it is a valid CSV.');
        }
      });
    };
    
    reader.readAsText(file);
  };

  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };

  return (
    <div className="csv-importer">
      <h2>Import CSV</h2>
      <div className="file-input-container">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          ref={fileInputRef}
          style={{ display: 'none' }}
        />
        <button onClick={() => fileInputRef.current?.click()}>
          Choose File
        </button>
        <span className="file-name">{fileName || 'No file selected'}</span>
      </div>
      
      <div className="advanced-options-toggle">
        <button 
          onClick={toggleAdvancedOptions}
          className="toggle-button"
        >
          {showAdvancedOptions ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>
      </div>
      
      {showAdvancedOptions && (
        <div className="advanced-options">
          <div className="option-group">
            <label>Delimiter:</label>
            <select 
              value={delimiter} 
              onChange={(e) => setDelimiter(e.target.value)}
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="custom">Custom</option>
            </select>
            
            {delimiter === 'custom' && (
              <input
                type="text"
                value={customDelimiter}
                onChange={(e) => setCustomDelimiter(e.target.value)}
                placeholder="Enter custom delimiter"
                maxLength={1}
                style={{ width: '40px', marginLeft: '10px' }}
              />
            )}
          </div>
          
          <div className="option-group checkbox">
            <input
              type="checkbox"
              id="replace-semicolons"
              checked={replaceSemicolons}
              onChange={(e) => setReplaceSemicolons(e.target.checked)}
            />
            <label htmlFor="replace-semicolons">
              Replace semicolons with commas before parsing
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSVImporter; 