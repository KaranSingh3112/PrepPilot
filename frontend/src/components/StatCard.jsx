

const StatCard = ({ label, value }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold text-slate-800">
        {value ?? '—'}
      </p>
    </div>
  );
};

export default StatCard;
