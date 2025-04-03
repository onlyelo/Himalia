import React from 'react';

interface LaserConnectorProps {
  direction?: 'vertical' | 'horizontal';
  className?: string;
  style?: React.CSSProperties;
}

const LaserConnector: React.FC<LaserConnectorProps> = ({ 
  direction = 'vertical',
  className = '',
  style = {}
}) => {
  const baseClass = direction === 'vertical' ? 'laser-connector' : 'laser-connector-horizontal';
  
  return (
    <div 
      className={`${baseClass} ${className}`}
      style={style}
    />
  );
};

export default LaserConnector;