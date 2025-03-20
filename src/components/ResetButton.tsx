import React from 'react';
import ResetIcon from './ResetIcon';

interface ResetButtonProps {
  onClick?: () => void;
  className?: string;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="pale-blue-btn" title="Start Over">
      <ResetIcon />
    </button>
  );
};

export default ResetButton; 