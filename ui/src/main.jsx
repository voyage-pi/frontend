import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { routesList } from "./routes.jsx";

const router = createBrowserRouter(routesList);


ReactDOM.createRoot(document.getElementById("root")).render(

  <React.StrictMode>
      <RouterProvider
        router={router}
        future={{
          v7_startTransition: true,
        }}
      />
  </React.StrictMode>
);