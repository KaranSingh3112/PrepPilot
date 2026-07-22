
const Loader = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            {/* A spinning circle made purely with Tailwind CSS */}
            <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
    )
}

export default Loader