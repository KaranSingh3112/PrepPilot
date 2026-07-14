import { useState } from "react"
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import api from "../api/axios";



const Login = () => {
    const [mode, setMode] = useState('register')

    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === 'register' && !form.username) {
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
        <div className="min-h-screen bg-slate-50 px-4 flex items-center justify-center">
            <div className="w-full max-w-md">

                {/* Brand */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center ">
                        <span className="text-white font-bold">P</span>
                    </div>
                    <span className="font-bold text-xl text-slate-800">PrepPilot</span>
                </Link>

                {/* Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    {/* tabs */}
                    <div className="flex bg-slate-100 rounded-lg p-1 mb-6">
                        {["login", "register"].map((m) => (
                            <button
                                key={m}
                                onClick={() => setMode(m)}
                                className={`flex-1 py-2 text-sm font-semibold rounded-md capitalize transition ${mode === m ? "bg-white text-slate-800 shadow-sm"
                                        : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {m === "login" ? "Sign In" : "Sign Up"}
                            </button>
                        ))}
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                        {mode === 'login' ? "Welcome back" : "Create your account"}
                    </h2>

                    <p className="text-sm text-slate-500 mb-6">
                        {mode === "login" ? "Sign in to continue practicing" : "Start your interview prep journey"}
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        {mode === "register" && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                                <input
                                    name="username"
                                    type="text"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 disable:bg-brand-400 text-white font-semibold rounded-lg transition"
                        >
                            {loading ? "Please wait..." : mode === 'login' ? "Sign In" : "Create Account"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login;