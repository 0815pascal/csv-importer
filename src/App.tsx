import { useState } from 'react'
import './App.css'
import CSVImporter from './components/CSVImporter'
import CSVDataEditor from './components/CSVDataEditor'
import catImage from './assets/cat.png'

// Predefined columns for new CSV files
const PREDEFINED_COLUMNS = [
  'First name',
  'Family name',
  'Email address',
  'Under 16 years of age',
  'Type of the AD Pass',
  'Attribute',
  'Name of division of group / name of subordinate organisation',
  'Job category (job description)',
  'Job category (position)',
  'West Management Office (Operation Headquarters)',
  'Media Centre',
  'Guest House',
  'EXPO Arena (backyard)',
  'EXPO Hall (backyard)',
  'EXPO National Day Hall (backyard)',
  'Valid period01(Start)',
  'Valid period01(End)',
  'Valid period02(Start)',
  'Valid period02(End)',
  'Valid period03(Start)',
  'Valid period03(End)',
  'Valid period04(Start)',
  'Valid period04(End)',
  'Valid period05(Start)',
  'Valid period05(End)',
  'Valid period06(Start)',
  'Valid period06(End)',
  'Valid period07(Start)',
  'Valid period07(End)',
  'Valid period08(Start)',
  'Valid period08(End)',
  'Valid period09(Start)',
  'Valid period09(End)',
  'Valid period10(Start)',
  'Valid period10(End)',
  'Valid period11(Start)',
  'Valid period11(End)',
  'Valid period12(Start)',
  'Valid period12(End)',
  'Valid period13(Start)',
  'Valid period13(End)',
  'Valid period14(Start)',
  'Valid period14(End)',
  'Valid period15(Start)',
  'Valid period15(End)',
  'Valid period16(Start)',
  'Valid period16(End)',
  'Valid period17(Start)',
  'Valid period17(End)',
  'Valid period18(Start)',
  'Valid period18(End)',
  'Valid period19(Start)',
  'Valid period19(End)',
  'Valid period20(Start)',
  'Valid period20(End)',
  'Valid period21(Start)',
  'Valid period21(End)',
  'Valid period22(Start)',
  'Valid period22(End)',
  'Valid period23(Start)',
  'Valid period23(End)',
  'Valid period24(Start)',
  'Valid period24(End)',
  'Valid period25(Start)',
  'Valid period25(End)',
  'Valid period26(Start)',
  'Valid period26(End)',
  'Valid period27(Start)',
  'Valid period27(End)',
  'Valid period28(Start)',
  'Valid period28(End)',
  'Valid period29(Start)',
  'Valid period29(End)',
  'Valid period30(Start)',
  'Valid period30(End)'
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
          <CSVDataEditor 
            data={csvData} 
            headers={headers}
            onDataChange={handleDataChange}
            resetData={resetData}
          />
        </div>
      )}
    </div>
  )
}

export default App
