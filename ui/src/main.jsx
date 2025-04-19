// index.jsx
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { routesList } from "./routes.jsx";
import AppContainer from "./components/AppContainer.jsx";
import FriendRequestProvider from "./context/FriendRequestContext.jsx";

const router = createBrowserRouter(routesList);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FriendRequestProvider>
      <AppContainer>
        <RouterProvider
          router={router}
          future={{
            v7_startTransition: true,
          }}
        />
      </AppContainer>
    </FriendRequestProvider>
  </React.StrictMode>
);
