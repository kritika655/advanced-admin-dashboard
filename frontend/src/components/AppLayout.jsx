import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, ShieldCheck, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const canManage = ['super_admin', 'admin'].includes(user?.role);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return <div className="app-shell">
    <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><ShieldCheck size={21}/></span><span>AdminFlow</span></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="side-nav">
        <NavLink to="/dashboard" onClick={() => setOpen(false)}><LayoutDashboard size={18}/> Overview</NavLink>
        {canManage && <NavLink to="/users" onClick={() => setOpen(false)}><Users size={18}/> User management</NavLink>}
      </nav>
      <div className="sidebar-bottom">
        <div className="profile-mini"><div className="avatar">{user?.name?.charAt(0)?.toUpperCase()}</div><div className="profile-copy"><strong>{user?.name}</strong><span>{user?.role?.replace('_', ' ')}</span></div></div>
        <button className="nav-logout" onClick={handleLogout}><LogOut size={17}/> Sign out</button>
      </div>
    </aside>
    {open && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X/> : <Menu/>}</button>
        <div><span className="topbar-eyebrow">ADMINISTRATION</span><strong>Workspace</strong></div>
        <div className="topbar-right"><span className="online-dot"/> <span className="topbar-user">{user?.name}</span><div className="avatar avatar-small">{user?.name?.charAt(0)?.toUpperCase()}</div></div>
      </header>
      <div className="page-content"><Outlet/></div>
    </main>
  </div>;
}
