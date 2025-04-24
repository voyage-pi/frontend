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

    // Function to load/refresh user data
    const loadUserData = async () => {
        setIsUserLoading(true);
        try {
            const response = await axiosUser.get('/user/current_user');
            console.log('User data refresh - API call successful:', response);
            
            // Extract user data from the nested response structure
            const userData = response.data.response;
            
            if (userData && userData.id) {
                console.log('User data loaded successfully with ID:', userData.id);
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
                const userData = response.data.response;
                
                if (userData && userData.id) {
                    console.log('User data loaded successfully with ID:', userData.id);
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
