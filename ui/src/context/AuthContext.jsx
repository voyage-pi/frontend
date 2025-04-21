import React, { use, useEffect } from 'react'
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

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axiosUser.get('/user/current_user');
                console.log('API call successful:', response);
                setUser(response.data)
                setIsAuthenticated(true)
                setIsUserLoading(false)
                navigate('/')
            } catch (error) {
                console.log('API call error:', error);
                //401 error enters has guest or not logged in
                setUser(LoggedUser)
                setIsAuthenticated(false)
                setIsUserLoading(false)
                // if you want to redirect to login page when not authenticated
                //navigate('/login')
            }
        }
        checkAuth()
    },[] )

    return(
        <AuthContext.Provider value={{ LoggedUser,isAuthenticated, setIsAuthenticated, isUserLoading, setIsUserLoading}}>
            {children}
        </AuthContext.Provider>
    )
}
