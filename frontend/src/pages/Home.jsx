import React from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import FeatureCard from '../components/FeatureCard';

export default function LandingPage() {
  const { user } = useAuth();
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
      {user ? <Navbar /> : <PublicNavbar />}

      {/* Hero Section  */}
      <section className='max-w-4xl mx-auto px-4 pt-20 pb-16 text-center'>
        <span className='inline-block px-4 py-1.5 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold mb-6'>✦ AI-Powered Interview Prep</span>

        <h1 className='text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-500 leading-tight mb-6'>
          Practice. <span className='text-brand-600'>Improve.</span> Get Hired
        </h1>

        <p className='text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed'>
          Upload your resume, complete a  interview, and
          get a detailed AI-generated performance report with personalized feedback.
        </p>

        <div className='flex items-center justify-center gap-4 flex-wrap mb-6'>
          <button
            onClick={handleGetStarted}
            className='px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold shadow-sm transition'>
            {user ? "Start new interview" : "Get started - it's free"}
          </button>

          {!user && (
            <Link to="/login" className='px-6 py-3 text-slate-700 hover:text-brand-600 font-semibold transition'>
              Sign in to your account
            </Link>
          )}
        </div>

        <p className='text-xs text-slate-500'>Works best in Chrome and edge. Microphone required</p>

      </section>


      <section className='bg-slate-50 border-y border-slate-200 py-16'>
        <div className='max-w-6xl mx-auto px-4'>
          <h2 className='text-sm font-semibold text-slate-500 uppercase tracking-wider text-center mb-10'>
            How It Works
          </h2>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            <FeatureCard 
              icon={<span className="text-2xl">📄</span>}
              title="Resume Parsing"
              description="Upload your PDF or DOCX resume. We extract your skills and experience automatically."
            />
            <FeatureCard 
              icon={<span className="text-2xl">🎤</span>}
              title="Voice Interview"
              description="Answer AI-generated questions using your microphone. Real-time transcript as you speak."
            />
            <FeatureCard
              icon={<span className="text-2xl">⭐</span>}
              title="AI Evaluation"
              description="Each answer is scored 1-10 by AI with specific, actionable feedback."
            />
            <FeatureCard
              icon={<span className="text-2xl">📊</span>}
              title="Performance Report"
              description="Get a hiring recommendation, strengths, weaknesses, and improvement suggestions."
            />
          </div>

        </div>
      </section>

      <footer className='py-8 text-center text-sm text-slate-500'>
        PrepPilot -  Practice smarter, interview better
      </footer>

    </div>
  )
}
