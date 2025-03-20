// Convert date string from YYYY/MM/DD to YYYY-MM-DD for HTML date input
export const formatDateForInput = (dateStr: string): string => {
  if (!dateStr) return '';
  return dateStr.replace(/\//g, '-');
};

// Convert date string from YYYY-MM-DD (HTML date input) to YYYY/MM/DD
export const formatDateForStorage = (dateStr: string): string => {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '/');
};

// Validate date string in YYYY/MM/DD format
export const isValidDate = (dateStr: string): boolean => {
  if (!dateStr) return true; // Empty is valid (for optional dates)
  
  const pattern = /^\d{4}\/\d{2}\/\d{2}$/;
  if (!pattern.test(dateStr)) return false;
  
  const [year, month, day] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);
  
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}; 