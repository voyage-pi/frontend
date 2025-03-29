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
}) => {
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value);
    onChange(newValue);
    
    if (onChangeComplete) {
      onChangeComplete(newValue);
    }
  };

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