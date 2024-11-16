import { createBrowserRouter } from "react-router-dom";
import SignIn from "./pages/auth/sign-in";
import SignUp from "./pages/auth/sign-up";
import Dashboard from "./pages/dashboard/dashboard";
import Profile from "./pages/profile/profile";

export const router = createBrowserRouter([
  {
    path: "/", 
    element: <SignIn />,
  },
  {
    path: "/sign-up", 
    element: <SignUp />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />
  },
  {
    path: "/profile",
    element: <Profile />
  },
]);

