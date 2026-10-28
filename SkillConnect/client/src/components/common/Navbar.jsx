import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const dashboardPath = user?.role === 'student' ? '/student/dashboard'
    : user?.role === 'recruiter' ? '/recruiter/dashboard'
    : user?.role === 'admin' ? '/admin/dashboard' : '/';

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="font-display text-xl font-bold text-ink-900">
          Skill<span className="text-amber-600">Connect</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link to="/jobs" className="text-sm font-medium text-ink-600 hover:text-ink-900">Jobs</Link>
          <Link to="/companies" className="text-sm font-medium text-ink-600 hover:text-ink-900">Companies</Link>
          <Link to="/about" className="text-sm font-medium text-ink-600 hover:text-ink-900">About</Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link to={`${dashboardPath.split('/dashboard')[0]}/notifications`} className="rounded-full p-2 text-ink-600 hover:bg-ink-50">
                <Bell size={18} />
              </Link>
              <Link to={dashboardPath} className="btn-secondary">Dashboard</Link>
              <button onClick={handleLogout} className="btn-primary">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Log in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-3 border-t border-ink-100 px-5 py-4 md:hidden">
          <Link to="/jobs" onClick={() => setOpen(false)}>Jobs</Link>
          <Link to="/companies" onClick={() => setOpen(false)}>Companies</Link>
          <Link to="/about" onClick={() => setOpen(false)}>About</Link>
          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setOpen(false)}>Dashboard</Link>
              <button onClick={handleLogout} className="btn-primary w-fit">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)}>Log in</Link>
              <Link to="/register" className="btn-primary w-fit" onClick={() => setOpen(false)}>Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
