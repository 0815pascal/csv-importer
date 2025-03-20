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
      [View Error Details]
    </button>
  );
};

export default ErrorDetailsButton; 