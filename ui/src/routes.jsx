import { Helmet } from 'react-helmet';
import Home from './routes/Home';

export const routesList = [
    {
        path: "/",
        element: (
          <>
            <Helmet>
              <title>Voyage - Home</title>
            </Helmet>
            <Home />
          </>
        ),
    },   
];