import { Helmet } from 'react-helmet';
import Trips from './routes/Trips';
import Saved from './routes/Saved';
import Friends from './routes/Friends';
import Forms from './routes/Forms';

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
    }
];