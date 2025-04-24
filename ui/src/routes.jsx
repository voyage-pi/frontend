import { Helmet } from 'react-helmet';
import Trips from './routes/Trips';
import Saved from './routes/Saved';
import Friends from './routes/Friends';
import Forms from './routes/Forms';
import Itinerary from './routes/Itinerary';
import Login from './routes/Login';
import Register from './routes/Register';
import NotFound from './routes/NotFound';
import { AuthProvider } from './context/AuthContext';

export const routesList = [
    {
      path: "/",
      element: (
        <>
          <Helmet>
            <title>Voyage - Trips</title>
          </Helmet>
          {/* AuthProvider is used to provide authentication context to the Trips component */}
          {/* This allows the Trips component to access the authentication state and user information */}
          {/* The AuthProvider component wraps the Trips component, allowing it to access the authentication context */}
          <AuthProvider>
            <Trips />
          </AuthProvider>
        </>
      ),
    },
    
    // User-specific routes with :userTag parameter
    {
      path: "/:userTag",
      element: (
        <>
          <Helmet>
            <title>Voyage - User Trips</title>
          </Helmet>
          <AuthProvider>
            <Trips />
          </AuthProvider>
        </>
      ),
    },
    
    {
      path: "/saved",
      element: (
        <>
          <Helmet>
            <title>Voyage - Saved</title>
          </Helmet>
          <AuthProvider>
            <Saved />
          </AuthProvider>
        </>
      ),
    },
    
    {
      path: "/:userTag/saved",
      element: (
        <>
          <Helmet>
            <title>Voyage - User Saved</title>
          </Helmet>
          <AuthProvider>
            <Saved />
          </AuthProvider>
        </>
      ),
    },

    {
      path: "/friends",
      element: (
        <>
          <Helmet>
            <title>Voyage - Friends</title>
          </Helmet>
          <AuthProvider>
            <Friends />
          </AuthProvider>
        </>
      ),
    },
    
    {
      path: "/:userTag/friends",
      element: (
        <>
          <Helmet>
            <title>Voyage - User Friends</title>
          </Helmet>
          <AuthProvider>
            <Friends />
          </AuthProvider>
        </>
      ),
    },

    {
      path: "/forms",
      element: (
        <>
          <Helmet>
            <title>Voyage - Forms</title>
          </Helmet>
          <Forms />
        </>
      ),
    },

    {
      path:"/itinerary/:tripId",
      element: (
        <>
          <Helmet>
            <title>Voyage - Itinerary</title>
          </Helmet>
          <AuthProvider>
            <Itinerary />
          </AuthProvider>
        </>
      ),
    },

    {
      path: "/login",
      element: (
        <>
          <Helmet>
            <title>Voyage - Login</title>
          </Helmet>
          <Login />
        </>
      ),
    },

    {
      path: "/register",
      element: (
        <>
          <Helmet>
            <title>Voyage - Register</title>
          </Helmet>
          <Register />
        </>
      ),
    }
];

routesList.push({
  path: "*",
  element: (
    <>
      <Helmet>
        <title>Voyage - Page Not Found</title>
      </Helmet>
      <NotFound />
    </>
  ),
});