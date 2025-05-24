import React from "react";
import { motion } from "framer-motion";

function DaySelector({
  days,
  calendar,
  selectedDay,
  onDaySelect,
  limitDays = 5,
}) {
  return (
    <motion.div
      className={`w-full flex p-4 h-1/8 py-5 ${
        days.length > limitDays ? "" : "overflow-x-auto"
      }`}
    >
      {Object.keys(calendar).map((day, index) => (
        <motion.div
          initial={false}
          animate={{
            boxShadow:
              selectedDay === index
                ? "0px 0px 20px 3px rgba(0, 0, 0, 0.1)"
                : "0px 0px 20px 0px rgba(0, 0, 0, 0.0)",
            color: selectedDay === index ? "#fe385c" : "black",
          }}
          exit={{
            boxShadow: "0px 0px 20px 30px rgba(0, 0, 0, 0.1)",
          }}
          key={index}
          className={`p-2 relative rounded-full w-full shadow-2xs text-center cursor-pointer`}
          onClick={() => onDaySelect(index)}
        >
          Day {index + 1}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default DaySelector;
