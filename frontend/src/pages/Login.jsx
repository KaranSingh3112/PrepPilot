import { useState } from "react"
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import api from "../api/axios";



const Login = () => {
    const [mode, setMode] = useState('login')

    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === 'register' && !form.name) {
            return toast.error("Please Enter your name")
        }
        if (!form.email || !form.password) {
            return toast.error("Please fill in all detailes");
        }
        setLoading(true);
        try {
            const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
            const payload = mode === "login" ?
                { email: form.email, password: form.password } :
                form

            const res = await api.post(endpoint, payload);

            login(res.data.token, res.data.user);
            toast.success(mode === 'login' ? "Welcome back!" : "Account created!");
            navigate("/dashboard")
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div>

                {/* Brand */}
                <Link to="/">
                    <div>
                        <span>P</span>
                        <div>
                            <span>PrepPilot</span>
                        </div>
                    </div>
                </Link>

                {/* Card */}
                <div>
                    {/* tabs */}
                    {["login", "register"].map((m) => (
                        <button key={m} onClick={() => setMode(m)}>
                            {m === "login" ? "Sign In" : "Sign Up"}
                        </button>
                    ))}
                </div>

                <h2>
                    {mode === 'login' ? "Welcome back" : "Create your account"}
                </h2>

                <p>
                    {mode === "login" ? "Sign in to continue practicing" : "Start your interview prep journey"}
                </p>

                <form>
                    {mode === "register" && (
                        <div>
                            <label>Name</label>
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                            />
                        </div>
                    )}

                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                        />
                    </div>

                    <div>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Please wait..." : mode === 'login' ? "Sign In" : "Create Account"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Login;