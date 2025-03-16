import { Helmet } from 'react-helmet';
import Trips from './routes/Trips';
import Saved from './routes/Saved';
import Friends from './routes/Friends';

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
    }
];