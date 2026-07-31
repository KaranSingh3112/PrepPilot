import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { useState, useEffect } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import InterviewCard from "../components/InterviewCard";

const History = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/interview/history/list');
        setInterviews(res.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return <><Navbar /><Loader /></>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Interview History</h1>
            <p className="text-slate-500 mt-1">
              {interviews.length} {interviews.length === 1 ? 'interview' : 'interviews'} total
            </p>
          </div>
          <Link
            to="/upload"
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition"
          >
            + New Interview
          </Link>
        </div>
        {/* Interview List */}
        {interviews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">No interviews yet</h3>
            <p className="text-slate-500 text-sm mb-5">
              Your completed interviews will appear here with scores and recommendations.
            </p>
            <Link
              to="/upload"
              className="inline-block px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition"
            >
              Start Your First Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((iv) => (
              <InterviewCard key={iv._id} interview={iv} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;