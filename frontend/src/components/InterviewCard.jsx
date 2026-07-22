
import { Link } from 'react-router-dom';

// Color map for recommendation badges
const badgeColors = {
  'Strong Hire': 'bg-emerald-100 text-emerald-700',
  'Hire':        'bg-sky-100 text-sky-700',
  'Maybe':       'bg-amber-100 text-amber-700',
  'No Hire':     'bg-rose-100 text-rose-700',
};

const InterviewCard = ({ interview }) => {
  const date = new Date(interview.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <Link
      to={`/report/${interview._id}`}
      className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-brand-300 hover:shadow-sm transition"
    >
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">{interview.jobRole}</h3>
          <p className="text-sm text-slate-500 mt-1">{date}</p>
        </div>

        <div className="flex items-center gap-4">
          {interview.totalScore !== null && (
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-800">{interview.totalScore}</p>
              <p className="text-xs text-slate-500">/ 10</p>
            </div>
          )}
          {interview.recommendation && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColors[interview.recommendation] || 'bg-slate-100 text-slate-700'}`}>
              {interview.recommendation}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default InterviewCard;
