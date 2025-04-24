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
import Layout from './components/Layout';

// Create a root layout that provides auth context to all routes
const AppLayout = ({ children }) => {
  return (
    <AuthProvider>
      <Layout>
        {children}
      </Layout>
    </AuthProvider>
  );
};

export const routesList = [
    {
      path: "/",
      element: (
        <AppLayout>
          <Helmet>
            <title>Voyage - Trips</title>
          </Helmet>
          <Trips />
        </AppLayout>
      ),
    },
    
    // User-specific routes with :userTag parameter
    {
      path: "/:userTag",
      element: (
        <AppLayout>
          <Helmet>
            <title>Voyage - User Trips</title>
          </Helmet>
          <Trips />
        </AppLayout>
      ),
    },
    
    {
      path: "/saved",
      element: (
        <AppLayout>
          <Helmet>
            <title>Voyage - Saved</title>
          </Helmet>
          <Saved />
        </AppLayout>
      ),
    },
    
    {
      path: "/:userTag/saved",
      element: (
        <AppLayout>
          <Helmet>
            <title>Voyage - User Saved</title>
          </Helmet>
          <Saved />
        </AppLayout>
      ),
    },

    {
      path: "/friends",
      element: (
        <AppLayout>
          <Helmet>
            <title>Voyage - Friends</title>
          </Helmet>
          <Friends />
        </AppLayout>
      ),
    },
    
    {
      path: "/:userTag/friends",
      element: (
        <AppLayout>
          <Helmet>
            <title>Voyage - User Friends</title>
          </Helmet>
          <Friends />
        </AppLayout>
      ),
    },

    {
      path: "/forms",
      element: (
        <AppLayout>
          <Helmet>
            <title>Voyage - Forms</title>
          </Helmet>
          <Forms />
        </AppLayout>
      ),
    },

    {
      path:"/itinerary/:tripId",
      element: (
        <AppLayout>
          <Helmet>
            <title>Voyage - Itinerary</title>
          </Helmet>
          <Itinerary />
        </AppLayout>
      ),
    },

    {
      path: "/login",
      element: (
        <AppLayout>
          <Helmet>
            <title>Voyage - Login</title>
          </Helmet>
          <Login />
        </AppLayout>
      ),
    },

    {
      path: "/register",
      element: (
        <AppLayout>
          <Helmet>
            <title>Voyage - Register</title>
          </Helmet>
          <Register />
        </AppLayout>
      ),
    }
];

routesList.push({
  path: "*",
  element: (
    <AppLayout>
      <Helmet>
        <title>Voyage - Page Not Found</title>
      </Helmet>
      <NotFound />
    </AppLayout>
  ),
});