import Loader from "./Loader";
import { Navigate } from "react-router-dom"

const { Children } = require("react");


const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if(loading) return <Loader />

    if (!user) return <Navigate to="/login" replace />

    return children;
}

export default ProtectedRoute;