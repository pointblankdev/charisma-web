import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface IconProps {
  icon: any; // You can specify a more precise type if needed
  color: string;
  size: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ icon, color, size, className }) => {
  const style = {
    color,
    fontSize: size,
  };

  return <FontAwesomeIcon icon={icon} style={style} className={className} />;
};

export default Icon;
