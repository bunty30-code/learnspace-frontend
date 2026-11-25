import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const AdminRoute = () => {
    const { role } = useAuth();

    if (role !== "admin") {
        return <Navigate to="/student" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;