import React from 'react';
import { FaCircleInfo } from 'react-icons/fa6';
import InformationalModal from '../InformationalModal';

const Card = ({ 
  icon: Icon, 
  title, 
  selected, 
  onClick, 
  infoSize = 20, 
  iconSize = 100, 
  iconInBox = false,
  text,
  id
}) => {

  const handleClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <div
      className={`card bg-white rounded-lg p-6 w-80 h-100 items-center justify-center shadow-[0px_0px_1px_0px] transform transition-transform duration-200 hover:scale-105 ${selected ? 'border-1 border-primary' : ''}`}
      onClick={handleClick}
    >
      <InformationalModal infoSize={infoSize} title={title} text={text} id={id} />
      <div className="flex justify-center mb-4">
        {/* Conditionally render icon in box or not */}
        {iconInBox ? (
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
            <Icon size={iconSize} className="text-white" />
          </div>
        ) : (
          <Icon size={iconSize} className="text-primary" />
        )}
      </div>
      <h3 className="text-2xl font-semibold text-primary">{title}</h3>
    </div>
  );
};

export default Card;