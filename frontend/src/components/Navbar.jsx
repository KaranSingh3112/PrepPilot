import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from '../context/AuthContext';
import toast from "react-hot-toast"

export default function Navbar() {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false)
    const navigate = useNavigate();

    const isActive = (path) =>
        location.pathname === path ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-brand-600";

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
        navigate("/login");
    }

    return (
        <nav className='bg-white border-b border-slate-200 sticky top-0 z-40'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    {/* Left Side: Logo + Links */}
                    <div className='flex items-center gap-8'>
                        <Link to="/dashboard" className='flex item-center gap-2'>
                            <div className='w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center'>
                                <span className='text-white font-bold text-sm'>P</span>
                            </div>
                            <span className='font-bold text-slate-800'>PrepPilot</span>
                        </Link>

                        <div className='hidden md:flex items-center gap-1'>
                            <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}>
                                Dashboard
                            </Link>

                            <Link to="/upload" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/upload")}`}>
                                New Interview
                            </Link>

                            <Link to="/history" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive("/history")}`}>
                                History
                            </Link>
                        </div>
                    </div>

                    {/* Right Side: User avatar */}
                    <div>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className='w-9 h-9 bg-brand-600 rounded-full text-white flex items-center justify-center font-semibold text-sm hover:ring-brand-300 transition'
                        >
                            {user?.name?.[0]?.toUpperCase() || "U"}
                        </button>

                        {
                            menuOpen && (
                                <>
                                    <div onClick={() => setMenuOpen(false)} className='fixed inset-0 z-10' />

                                    <div className='absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1'>
                                        <div className='px-4 py-2 border-b boder-slate-100'>
                                            <p className='text-sm font-semibold text-slate-800 truncate'>{user?.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                        </div>


                                        <button onClick={handleLogout} className='w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50'>
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )
                        }
                    </div>
                </div>
            </div>
        </nav>
    )
}
