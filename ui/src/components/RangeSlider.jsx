import React from "react";

const RangeSlider = ({
  value,
  onChange,
  min, 
  max,
  step,
  currency,
  rangeClassName,
  valueClassName ,
  showLabels = true,
  labelClassName ,
  onChangeComplete = null,
  variant = "default", 
}) => {
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
    
    if (onChangeComplete) {
      onChangeComplete(newValue);
    }
  };

  if (variant === "compact") {
    return (
      <div>
        <div className="flex items-center gap-2 -mb-1">
          <span className="text-md font-medium">Radius (m):</span>
          <span className="text-primary font-medium">{value}</span>
        </div>
        <div className="mb-3">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            style={{
              background: `linear-gradient(to right, #ff4081 0%, #ff4081 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className={rangeClassName}
      />

      {showLabels && (
        <div className="flex justify-between px-2 mt-1">
          <span className={labelClassName}>{min}</span>
          <span className={labelClassName}>{max} +</span>
        </div>
      )}
    </div>
  );
};

export default RangeSlider;