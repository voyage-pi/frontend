"use client"

import { useState } from "react"
import { FaFileCirclePlus, FaRecycle, FaCircleInfo } from "react-icons/fa6"
import PreferenceSelection from "./Step5ContentPP"

const Step5Content = () => {
  const [showPreferenceSelection, setShowPreferenceSelection] = useState(false)

  const handleNewPreferencesClick = () => {
    setShowPreferenceSelection(true)
  }

  const handleBackToCards = () => {
    setShowPreferenceSelection(false)
  }

  if (showPreferenceSelection) {
    return (
      <div className="p-6">
        <PreferenceSelection />
      </div>
    )
  }

  return (
    <div className="text-center p-6 -mb-10">
      <div className="flex justify-center space-x-40 pt-9">
        {/* Individual Trip Card */}
        <div className="card bg-white rounded-lg p-6 w-80 h-100 items-center justify-center shadow-[0px_0px_1px_0px] transform transition-transform duration-200 hover:scale-105">
          <div className="absolute top-5 right-5 text-primary/90">
            <FaCircleInfo size={25} />
          </div>
          <div className="flex justify-center mb-4">
            <FaRecycle size={100} className="text-primary" />
          </div>
          <h3 className="text-2xl font-semibold text-primary">
            {" "}
            Reuse Preferences <br /> Profile{" "}
          </h3>
        </div>

        {/* Group Trip Card */}
        <div
          className="card bg-white rounded-lg p-6 w-80 items-center justify-center shadow-[0px_0px_1px_0px] transform transition-transform duration-200 hover:scale-105 cursor-pointer"
          onClick={handleNewPreferencesClick}
        >
          <div className="absolute top-5 right-5 text-primary/90">
            <FaCircleInfo size={25} />
          </div>
          <div className="flex justify-center mb-4">
            <FaFileCirclePlus size={100} className="text-primary" />
          </div>
          <h3 className="text-2xl font-semibold text-primary">
            {" "}
            New Preferences <br /> Profile{" "}
          </h3>
        </div>
      </div>
    </div>
  )
}

export default Step5Content

