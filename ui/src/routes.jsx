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
        <AuthProvider>
          <Helmet>
            <title>Voyage - Trips</title>
          </Helmet>
          <Trips />
        </AuthProvider>
      ),
    },
    
    // User-specific routes with :userTag parameter
    {
      path: "/:userTag",
      element: (
        <AuthProvider>
          <Helmet>
            <title>Voyage - User Trips</title>
          </Helmet>
          <Trips />
        </AuthProvider>
      ),
    },
    
    {
      path: "/saved",
      element: (
        <AuthProvider>
          <Helmet>
            <title>Voyage - Saved</title>
          </Helmet>
          <Saved />
        </AuthProvider>
      ),
    },
    
    {
      path: "/:userTag/saved",
      element: (
        <AuthProvider>
          <Helmet>
            <title>Voyage - User Saved</title>
          </Helmet>
          <Saved />
        </AuthProvider>
      ),
    },

    {
      path: "/friends",
      element: (
        <AuthProvider>
          <Helmet>
            <title>Voyage - Friends</title>
          </Helmet>
          <Friends />
        </AuthProvider>
      ),
    },
    
    {
      path: "/:userTag/friends",
      element: (
        <AuthProvider>
          <Helmet>
            <title>Voyage - User Friends</title>
          </Helmet>
          <Friends />
        </AuthProvider>
      ),
    },

    {
      path: "/forms",
      element: (
        <AuthProvider>
          <Helmet>
            <title>Voyage - Forms</title>
          </Helmet>
          <Forms />
        </AuthProvider>
      ),
    },

    {
      path:"/itinerary/:tripId",
      element: (
        <AuthProvider>
          <Helmet>
            <title>Voyage - Itinerary</title>
          </Helmet>
          <Itinerary />
        </AuthProvider>
      ),
    },

    {
      path: "/login",
      element: (
        <AuthProvider>
          <Helmet>
            <title>Voyage - Login</title>
          </Helmet>
          <Login />
        </AuthProvider>
      ),
    },

    {
      path: "/register",
      element: (
        <AuthProvider>
          <Helmet>
            <title>Voyage - Register</title>
          </Helmet>
          <Register />
        </AuthProvider>
      ),
    }
];

routesList.push({
  path: "*",
  element: (
    <AuthProvider>
      <Helmet>
        <title>Voyage - Page Not Found</title>
      </Helmet>
      <NotFound />
    </AuthProvider>
  ),
});