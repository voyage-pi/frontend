import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { axiosUser } from "../utils/axiosInstance";
import PageTemplate from "../components/PageTemplate";
import { FaHeart } from "react-icons/fa";

function Saved() {
  const { userTag } = useParams(); // Get userTag from URL params
  const navigate = useNavigate();
  const { LoggedUser, isAuthenticated, isUserLoading } = useAuth();
  
  // Determine if we're viewing our own saved items or someone else's
  const [viewingUser, setViewingUser] = useState(null);
  const isViewingOwnSaved = !userTag || (LoggedUser && userTag === LoggedUser.tag);
  
  // If userTag is provided but doesn't match LoggedUser, fetch that user's info
  useEffect(() => {
    const fetchUserByTag = async () => {
      if (userTag && (!LoggedUser || userTag !== LoggedUser.tag)) {
        try {
          // Fetch user info by tag
          const response = await axiosUser.get(`/user/tag/${userTag}`);
          if (response.data && response.data.response) {
            setViewingUser(response.data.response);
          }
        } catch (error) {
          console.error("Error fetching user by tag:", error);
          // If user not found, redirect to home
          navigate('/');
        }
      } else if (LoggedUser) {
        // If viewing own saved items, set viewingUser to LoggedUser
        setViewingUser(LoggedUser);
      }
    };
    
    if (!isUserLoading) {
      fetchUserByTag();
    }
  }, [userTag, LoggedUser, isUserLoading, navigate]);
  
  return (
    <PageTemplate
      headerIcon={<FaHeart className="text-3xl text-primary" />}
      headerTitle={viewingUser ? (isViewingOwnSaved ? "My Saved Places" : `${viewingUser.name}'s Saved Places`) : "Saved Places"}
    >
      <div className="p-8">
        {!viewingUser ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* This would be populated with saved places data */}
            <div className="text-center py-10 col-span-full text-gray-500">
              {isViewingOwnSaved ? 
                "You don't have any saved places yet. Start saving your favorite destinations!" : 
                `${viewingUser.name} doesn't have any saved places to show.`}
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}

export default Saved;

