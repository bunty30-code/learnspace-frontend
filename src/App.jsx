import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";

import router from "./app/router";
import { fetchMe } from "./features/auth/authSlice";
import { FullScreenLoader } from "./components/common/Skeleton";

function App() {
  const dispatch = useDispatch();
  const initialized = useSelector((state) => state.auth.initialized);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  if (!initialized) {
    return <FullScreenLoader message="Checking your session" />;
  }

  return <RouterProvider router={router} />;
}

export default App;