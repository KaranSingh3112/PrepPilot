import Loader from "./Loader";
import { Navigate } from "react-router-dom"

import { children } from "react";
import { useAuth } from "../context/AuthContext";


const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if(loading) return <Loader />

    if (!user) return <Navigate to="/login" replace />

    return children;
}

export default ProtectedRoute;