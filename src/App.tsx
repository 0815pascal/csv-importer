import { useState } from 'react'
import './App.css'
import CSVImporter from './components/CSVImporter'
import CSVDataEditor from './components/CSVDataEditor'
import CSVExporter from './components/CSVExporter'
import catImage from './assets/cat.png'

// Predefined columns for new CSV files
const PREDEFINED_COLUMNS = [
  'id',
  'first_name',
  'last_name',
  'email',
  'department',
  'is_active',
  'is_manager',
  'remote_worker'
];

function App() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'import' | 'create'>('import');
  
  const handleDataImported = (data: any[], headers: string[]) => {
    setCsvData(data);
    setHeaders(headers);
  };
  
  const handleDataChange = (newData: any[]) => {
    setCsvData(newData);
  };
  
  const handleCreateNewCSV = () => {
    setHeaders(PREDEFINED_COLUMNS);
    setCsvData([]); // Start with an empty dataset
  };
  
  const resetData = () => {
    setCsvData([]);
    setHeaders([]);
    setActiveTab('import'); // Reset to import tab
  };

  return (
    <div className="app">
      <div className="app-header">
        <img src={catImage} alt="Cat" className="title-image" />
        <h1>Meli's Little Helper</h1>
      </div>
      
      {headers.length === 0 ? (
        // Show tabs for Import or Create when no data is loaded
        <div className="container initial-container">
          <div className="tabs">
            <button 
              className={activeTab === 'import' ? 'active' : ''} 
              onClick={() => setActiveTab('import')}
            >
              Import Existing CSV
            </button>
            <button 
              className={activeTab === 'create' ? 'active' : ''} 
              onClick={() => {
                setActiveTab('create');
                handleCreateNewCSV(); // Immediately create a new CSV with predefined columns
              }}
            >
              Create New CSV
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'import' && (
              <CSVImporter onDataImported={handleDataImported} />
            )}
          </div>
        </div>
      ) : (
        // Show editor once data is loaded or created
        <div className="container">
          <div className="header-actions">
            <button onClick={resetData} className="reset-btn">
              Start Over
            </button>
          </div>
          
          <CSVDataEditor 
            data={csvData} 
            headers={headers}
            onDataChange={handleDataChange}
          />
          
          <CSVExporter data={csvData} headers={headers} />
        </div>
      )}
    </div>
  )
}

export default App
