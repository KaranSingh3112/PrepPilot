

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';

const badgeColors = {
    'Strong Hire': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Hire': 'bg-sky-100 text-sky-700 border-sky-200',
    'Maybe': 'bg-amber-100 text-amber-700 border-amber-200',
    'No Hire': 'bg-rose-100 text-rose-700 border-rose-200',
};

const Report = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await api.get(`/interview/${id}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
                alert('Failed to load report');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [id, navigate]);


    // Download report as a printable HTML file
    const downloadReport = () => {
        if (!data) return;

        const html = `
<!DOCTYPE html><html><head><title>PrepPilot Report - ${data.jobRole}</title>
<style>
  body{font-family:Inter,Arial,sans-serif;max-width:800px;margin:30px auto;padding:20px;color:#1e293b}
  h1{color:#4f46e5;border-bottom:2px solid #4f46e5;padding-bottom:8px}
  h2{color:#334155;margin-top:30px}
  .score{font-size:48px;font-weight:800;color:#4f46e5}
  .badge{display:inline-block;padding:6px 14px;border-radius:999px;font-weight:600}
  .qa{border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin:10px 0}
  ul{padding-left:20px}
  li{margin:6px 0}
</style></head><body>
<h1>PrepPilot Interview Report</h1>
<p><b>Role:</b> ${data.jobRole} &nbsp;&nbsp; <b>Date:</b> ${new Date(data.createdAt).toLocaleDateString()}</p>
<h2>Overall Score</h2>
<div class="score">${data.totalScore} / 10</div>
<p><span class="badge">${data.recommendation}</span></p>
<h2>Strengths</h2><ul>${data.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
<h2>weakness</h2><ul>${data.weakness.map(w => `<li>${w}</li>`).join('')}</ul>
<h2>Suggestions</h2><ul>${data.suggestions.map(s => `<li>${s}</li>`).join('')}</ul>
<h2>Detailed Feedback</h2><p>${data.detailedFeedback}</p>
<h2>Question-wise Performance</h2>
${data.qaList.map((qa, i) => `
  <div class="qa">
    <p><b>Q${i + 1}:</b> ${qa.question}</p>
    <p><b>Your Answer:</b> ${qa.answer}</p>
    <p><b>Score:</b> ${qa.score}/10</p>
    <p><b>Feedback:</b> ${qa.feedback}</p>
  </div>
`).join('')}
</body></html>`;

        // Create a Blob (in-memory file) and trigger download
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `PrepPilot_Report_${data.jobRole.replace(/\s+/g, '_')}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return <><Navbar /><Loader /></>;
    if (!data) return null;

    console.log({
        strengths: data?.strengths,
        weakness: data?.weakness,
        suggestions: data?.suggestions,
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Interview Report</h1>
                        <p className="text-slate-500 mt-1">
                            {data.jobRole} · {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={downloadReport}
                            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition"
                        >
                            ⬇ Download
                        </button>
                        <Link
                            to="/dashboard"
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg transition"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Score card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Overall Score</p>
                        <p className="text-5xl font-extrabold text-slate-800">{data.totalScore}</p>
                        <p className="text-slate-500">out of 10</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Recommendation</p>
                        <span className={`inline-block px-5 py-2 rounded-full text-base font-bold border ${badgeColors[data.recommendation]}`}>
                            {data.recommendation}
                        </span>
                    </div>
                </div>

                {/* Strengths / weakness / Suggestions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <ReportBlock title="💪 Strengths" items={data.strengths} color="emerald" />
                    <ReportBlock title="⚠️ weakness" items={data.weakness} color="rose" />
                    <ReportBlock title="💡 Suggestions" items={data.suggestions} color="sky" />
                </div>

                {/* Detailed feedback */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Detailed Feedback</h2>
                    <p className="text-slate-700 leading-relaxed">{data.detailedFeedback}</p>
                </div>

                {/* Question-wise */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Question-wise Performance</h2>
                    <div className="space-y-3">
                        {data.qaList.map((qa, idx) => (
                            <details key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                                <summary className="cursor-pointer p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between">
                                    <span className="font-medium text-slate-800 truncate pr-4">Q{idx + 1}: {qa.question}</span>
                                    <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${qa.score >= 8 ? 'bg-emerald-100 text-emerald-700' :
                                            qa.score >= 5 ? 'bg-amber-100 text-amber-700' :
                                                'bg-rose-100 text-rose-700'
                                        }`}>
                                        {qa.score}/10
                                    </span>
                                </summary>
                                <div className="p-4 space-y-2 text-sm">
                                    <p><b className="text-slate-700">Your Answer:</b> <span className="text-slate-600">{qa.answer}</span></p>
                                    <p><b className="text-slate-700">Feedback:</b> <span className="text-slate-600">{qa.feedback}</span></p>
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Small helper component for the three colored blocks
const ReportBlock = ({ title, items, color }) => {
    const colorMap = {
        emerald: 'border-emerald-200 bg-emerald-50/50',
        rose: 'border-rose-200 bg-rose-50/50',
        sky: 'border-sky-200 bg-sky-50/50',
    };
    return (
        <div className={`border ${colorMap[color]} rounded-xl p-5`}>
            <h3 className="font-semibold text-slate-800 mb-3">{title}</h3>
            <ul className="space-y-2 text-sm text-slate-700">
                {items?.length ? (
                    items.map((it, i) => (
                        <li key={i} className="flex gap-2">
                            <span>•</span>
                            <span>{it}</span>
                        </li>
                    ))
                ) : (
                    <li>No data available</li>
                )}
            </ul>
        </div>
    );
};

export default Report;
