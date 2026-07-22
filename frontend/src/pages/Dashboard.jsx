import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import { Link } from 'react-router-dom';
import InterviewCard from '../components/InterviewCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  //On page load fetch user's history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/interview/history/list");
        setInterviews(res.data);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false)
      }
    };
    fetchHistory();
  }, [])

  const totalInterviews = interviews.length;
  const completedInterviews = interviews.filter(i => i.completed);

  const avgScore = completedInterviews.length
    ? (
      completedInterviews.reduce(
        (s, i) => s + (i.totalScore || 0),
        0
      ) / completedInterviews.length
    ).toFixed(1)
    : null;

  const strongHires = completedInterviews.filter(
    i => i.recommendation === 'Strong Hire'
  ).length;

  const hires = completedInterviews.filter(
    i =>
      i.recommendation === 'Hire' ||
      i.recommendation === 'Strong Hire'
  ).length;

  if (loading)
    return (
      <>
        <Navbar />
        <Loader />
      </>
    );

  return (
    <div className='min-h-screen bg-slate-50'>
      <Navbar />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-start justify-between mb-8 flex-wrap gap-4'>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-slate-500 mt-1">
              Ready to sharpen your interview skills?
            </p>
          </div>
          <Link
            to="/upload"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition"
          >
            Start New Interview
          </Link>
        </div>


        {/* Stats */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"'>
          <StatCard
            label="Total interviews"
            value={totalInterviews}
          />
          <StatCard
            label="Avg Score"
            value={avgScore}
          />
          <StatCard
            label="Strong Hires"
            value={strongHires}
          />
          <StatCard
            label="Hires"
            value={hires}
          />
        </div>

        {/* Recent Interviews */}
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Recent Interviews</h2>
        {interviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className='text-2xl'>🎤</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">No interviews</h3>
            <p className="text-slate-500 text-sm mb-5"> Upload your resume to start your first AI mock interview</p>

            <Link to="/upload" className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition">
              Start Your First Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.slice(0, 5).map((iv) => (
              <InterviewCard
                key={iv._id}
                interview={iv}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
