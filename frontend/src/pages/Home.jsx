import React from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';

export default function LandingPage() {
  const {user} = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/upload") 
    } else {
      navigate("/login")
    }
  }
  return (
    <div className='min-h-screen bg-white'>
      {user ? <Navbar />: <PublicNavbar/> }
    </div>
  )
}
