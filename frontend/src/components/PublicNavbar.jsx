import { Link } from 'react-router-dom';

const PublicNavbar = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand logo — links to home itself */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-slate-800">PrepPilot</span>
          </Link>

          {/* Right side: only a Sign In button for guests */}
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;