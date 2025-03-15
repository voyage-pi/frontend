import { Helmet } from 'react-helmet';
import Trips from './routes/Trips';

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
];