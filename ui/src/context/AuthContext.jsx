import React, { useEffect } from 'react'
import { createContext, useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { axiosUser } from '../utils/axiosInstance'

const AuthContext = createContext()
// useContext is a React hook that allows you to access the context value
// use the useAuth to access the object returned by the AuthContext {{LoggedUser, isAuthenticated, setIsAuthenticated, isUserLoading, setIsUserLoading}}
export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [LoggedUser, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isUserLoading, setIsUserLoading] = useState(true)

    const navigate = useNavigate()

    // Process user data to ensure all required fields are present
    const processUserData = (userData) => {
        if (!userData) return null;
        
        // Ensure stats object exists
        if (!userData.stats) {
            userData.stats = {};
        }
        
        // Fetch trips count if not already there
        if (typeof userData.stats.trips === 'undefined') {
            // Try to get from trip_count or trips_count properties if they exist
            userData.stats.trips = userData.trip_count || userData.trips_count || 0;
        }
        
        // Fetch friends count if not already there
        if (typeof userData.stats.friends === 'undefined') {
            userData.stats.friends = userData.friends_count || 0;
        }
        
        // Fetch countries count if not already there
        if (typeof userData.stats.countries === 'undefined') {
            userData.stats.countries = userData.countries_count || 0;
        }
        
        // Fetch saved count if not already there
        if (typeof userData.stats.saved === 'undefined') {
            userData.stats.saved = userData.saved_count || 0;
        }
        
        return userData;
    };

    // Function to load user trip statistics
    const loadUserStats = async (userId) => {
        if (!userId) return null;

        try {
            // Fetch user trip statistics
            const statsResponse = await axiosUser.get(`/trip-info/stats/${userId}`);
            console.log(`Trip stats for user ${userId}:`, statsResponse.data);

            // Fetch user's friends
            const friendsResponse = await axiosUser.get('/friends/users/');
            console.log(`Friends for user ${userId}:`, friendsResponse.data);

            // Process the stats response
            const stats = statsResponse.data.data;
            const friends = friendsResponse.data;
            const friendCount = friends.length;

            return {
                trips: stats.total_trips || 0,
                countries: stats.countries_visited || 0,
                cities: stats.cities_visited || 0,
                days: stats.total_days || 0,
                friends: friendCount
            };
        } catch (error) {
            console.error("Error fetching user stats:", error);
            return null;
        }
    };

    // Function to load/refresh user data
    const loadUserData = async () => {
        setIsUserLoading(true);
        try {
            const response = await axiosUser.get('/user/current_user');
            console.log('User data refresh - API call successful:', response);
            
            // Extract user data from the nested response structure
            let userData = response.data.response;
            
            if (userData && userData.id) {
                console.log('User data loaded successfully with ID:', userData.id);
                
                // Try to load user statistics
                const stats = await loadUserStats(userData.id);
                if (stats) {
                    // Make sure stats object exists
                    if (!userData.stats) userData.stats = {};
                    
                    // Update stats with data from the API
                    userData.stats.trips = stats.trips;
                    userData.stats.countries = stats.countries;
                    userData.stats.cities = stats.cities;
                    userData.stats.days = stats.days;
                    userData.stats.friends = stats.friends;
                }
                
                // Process user data to ensure all fields are present
                userData = processUserData(userData);
                
                // Update the user state
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                console.error('Invalid user data structure:', response.data);
                throw new Error('User data is missing required properties');
            }
        } catch (error) {
            console.log('User data refresh - API call error:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsUserLoading(false);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axiosUser.get('/user/current_user');
                console.log('API call successful:', response);
                
                // Extract user data from the nested response structure
                let userData = response.data.response;
                
                if (userData && userData.id) {
                    console.log('User data loaded successfully with ID:', userData.id);
                    
                    // Try to load user statistics
                    const stats = await loadUserStats(userData.id);
                    if (stats) {
                        // Make sure stats object exists
                        if (!userData.stats) userData.stats = {};
                        
                        // Update stats with data from the API
                        userData.stats.trips = stats.trips;
                        userData.stats.countries = stats.countries;
                        userData.stats.cities = stats.cities;
                        userData.stats.days = stats.days;
                        userData.stats.friends = stats.friends;
                    }
                    
                    // Process user data to ensure all fields are present
                    userData = processUserData(userData);
                    
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    console.error('Invalid user data structure:', response.data);
                    throw new Error('User data is missing required properties');
                }
                
                setIsUserLoading(false);
            } catch (error) {
                console.log('API call error:', error);
                //401 error enters has guest or not logged in
                setUser(null)
                setIsAuthenticated(false)
                setIsUserLoading(false)
                // if you want to redirect to login page when not authenticated
                //navigate('/login')
            }
        }
        checkAuth()
    },[] )

    return(
        <AuthContext.Provider value={{ 
            LoggedUser, 
            setUser, 
            isAuthenticated, 
            setIsAuthenticated, 
            isUserLoading, 
            setIsUserLoading,
            loadUserData
        }}>
            {children}
        </AuthContext.Provider>
    )
}
