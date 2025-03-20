import Papa from 'papaparse';

interface CSVExporterProps {
  data: any[];
  headers: string[];
}

const CSVExporter = ({ data, headers }: CSVExporterProps) => {
  const handleExport = () => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    // Filter out empty rows (rows with only commas and zeros)
    const filteredData = data.filter(row => {
      // Check if any value is not empty or "0"
      return Object.values(row).some(value => 
        value !== "" && value !== "0" && value !== 0
      );
    });

    if (filteredData.length === 0) {
      alert('No non-empty data to export');
      return;
    }

    // Generate CSV data
    const csv = Papa.unparse({
      fields: headers,
      data: filteredData
    });

    // Create a blob and download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'exported_data.csv');
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="csv-exporter">
      <button 
        onClick={handleExport}
        disabled={data.length === 0}
        className="magic-export-btn action-button"
      >
        <span className="magic-wand">✨</span>
        Export to CSV
      </button>
    </div>
  );
};

export default CSVExporter; 