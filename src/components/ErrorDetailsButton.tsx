import React from 'react';

interface ErrorDetailsButtonProps {
  onClick: () => void;
  className?: string;
}

const ErrorDetailsButton: React.FC<ErrorDetailsButtonProps> = ({ onClick, className = '' }) => {
  return (
    <button 
      className={`error-details-button ${className}`}
      onClick={onClick}
      title="View error details"
    >
      &#128269;
    </button>
  );
};

export default ErrorDetailsButton; 