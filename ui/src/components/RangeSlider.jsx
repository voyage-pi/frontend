import React from "react";

const RangeSlider = ({
  value,
  onChange,
  min = 0,
  max = 2500,
  step = 1,
  currency = "€",
  rangeClassName = "range range-error range-sm",
  valueClassName = "text-error text-5xl font-bold mb-6",
  showLabels = true,
  labelClassName = "text-sm",
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Radius (m):</span>
          <span className="text-pink-500 font-medium">{value}</span>
        </div>
        <div className="mt-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            style={{
              background: `linear-gradient(to right, #ff4081 0%, #ff4081 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className={valueClassName}>
        {value}{currency}
      </p>

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
          <span className={labelClassName}>{max}+</span>
        </div>
      )}
    </div>
  );
};

export default RangeSlider;