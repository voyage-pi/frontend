import { Helmet } from 'react-helmet';
import Trips from './routes/Trips';
import Saved from './routes/Saved';
import Friends from './routes/Friends';
import Forms from './routes/Forms';
import Itinerary from './routes/Itinerary';
import Login from './routes/Login';
import Register from './routes/Register';

export const routesList = [
    {
      path: "/",
      element: (
        <>
          <Helmet>
            <title>Voyage - Trips</title>
          </Helmet>
          <Trips />
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
          <Saved />
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
          <Friends />
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
          <Itinerary />
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