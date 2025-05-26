import { useState, useEffect } from "react";
import Notification from "../../Notification";
import { axiosUser } from "../../../utils/axiosInstance";
import { FaArrowRight } from "react-icons/fa";
import LoadingAnimation from "../../LoadingAnimation";

const OldPreferences = ({ setCurrentStep }) => {
  const [notification, setNotification] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoadingAnimation] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await axiosUser.get("/preferences/user");
        console.log("Fetched preferences:", response.data);
        setPreferences(response.data.response.preferences);
      } catch (error) {
        console.error("Error fetching preferences:", error);
        setLoadingAnimation;
      } finally {
        setLoadingAnimation(false);
      }
    };
    fetchPreferences();
  }, []);

  const handlePrefererences = () => {
    const selectedProfile = parseInt(document.querySelector("select").value);
    console.log("Selected profile:", parseInt(selectedProfile));
    if (isNaN(selectedProfile)) {
      setNotification(
        <Notification
          type="info"
          text="Please select a preferences profile"
          onClose={() => setNotification(null)}
        />
      );
      return;
    }
    preferences.forEach((pref) => {
      if (pref.id === selectedProfile) {
        const ratings = pref.answers.map((q) => q.value);
        console.log("Selected profile ratings:", ratings);
        localStorage.setItem("userRatings", JSON.stringify(ratings));
        localStorage.setItem("preferencesName", pref.name);
        localStorage.setItem("selectedPreferenceId", selectedProfile.toString());
        console.log("Stored preference ID:", selectedProfile);
      }
    });
    setCurrentStep((prev) => prev + 1);
  };
  return (
    <>
      <div className="text-center p-6 -mb-10">
        <h2 className="text-3xl mb-10">
          Set your previous preferences profile!
        </h2>
        <div className="p-6 flex justify-center text-center">
          {!loading && notification}
          {loading ? (
            <LoadingAnimation />
          ) : (
            <>
              <select defaultValue="Pick a color" className="select">
                <option value="" disabled={true}>
                  Pick a preferences profile
                </option>
                {!loading && preferences.length > 0 && (
                  <>
                    {preferences.map((pref) => (
                      <option key={pref.id} value={pref.id}>
                        {pref.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <button
                onClick={handlePrefererences}
                className="rounded-full bg-primary text-white text-center p-1 m-3"
              >
                <FaArrowRight className="text-white mx-auto" />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default OldPreferences;
