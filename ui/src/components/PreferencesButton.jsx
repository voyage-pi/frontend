import React from "react";
import { MdEditSquare } from "react-icons/md";

const PreferencesButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded-full border-1 border-secondary/10 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
      title="Edit Preference Profile"
    >
      <div className="flex flex-row items-center gap-x-3 m-1">
        <MdEditSquare className="text-primary ml-1" />
        <div className="mr-2">
          <span className="text-primary">Preferences</span>
        </div>
      </div>
    </button>
  );
};

export default PreferencesButton; 