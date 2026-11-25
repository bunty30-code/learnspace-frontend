import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const StudentRoute = () => {
    const { role } = useAuth();

    if (role !== "student") {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
};

export default StudentRoute;