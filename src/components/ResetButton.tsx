import React from 'react';

interface ResetButtonProps {
  onClick?: () => void;
  className?: string;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="pale-blue-btn" title="Start Over">
      <span className="reset-icon">⏎</span>
    </button>
  );
};

export default ResetButton; 