import React from "react";
import { IoSettingsOutline } from "react-icons/io5";

const PreferencesButton = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="fixed right-8 top-28 z-40 btn btn-md btn-primary rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors px-4 py-2"
      title="Edit Preference Profile"
    >
      <IoSettingsOutline className="text-white text-xl" />
      <span className="ml-2 text-white text-sm font-medium">Preferences</span>
    </div>
  );
};

export default PreferencesButton; 