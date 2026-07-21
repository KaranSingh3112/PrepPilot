
const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md hover:border-brand-200 transition">
            <div className="w-11 h-11 bg-brand-50 rounded-lg flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">{title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>
    )
}

export default FeatureCard;