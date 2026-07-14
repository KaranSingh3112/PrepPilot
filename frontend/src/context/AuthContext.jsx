import { Children, createContext, useContext, useEffect, useState } from "react"
import api from "../api/axios";


const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if(!ctx) throw new Error("useAuth must be used inside <AuthProvides>");
    return ctx;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const chechkAuth = async () => {
            const token = localStorage.getItem('token')
            if(!token){
                setLoading(false);
                return;
            }
            try {
                const res = await api.get("/auth/me");
                setUser(res.data.user);
            } catch (error) {
                setUser(null)
            }finally{
                setLoading(false);
            }
        };
        chechkAuth();
    }, []);


    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null)
    };

    const value = { user, loading, login, logout };


  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  )
}
