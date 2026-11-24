import { useEffect, useState } from 'react';
import { Users, UserCheck, Shield, UserX, ArrowUpRight, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function StatCard({ label, value, icon: Icon, tone, note }) {
  return <article className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={19}/></span></div><div className="stat-value">{value ?? '—'}</div><div className="stat-note">{note}</div></article>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    try { setError(''); setLoading(true); const response = await api.get('/dashboard/stats'); setData(response.data); }
    catch (err) { setError(err.response?.data?.message || 'Could not load dashboard data.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  return <div className="content-stack">
    <div className="page-heading"><div><span className="eyebrow">OVERVIEW</span><h1>Good to see you, {user?.name?.split(' ')[0]}.</h1><p>Here’s what’s happening in your workspace today.</p></div><button className="btn btn-secondary" onClick={load}><RefreshCw size={16}/> Refresh</button></div>
    {error && <div className="alert alert-error">{error} <button className="text-button" onClick={load}>Try again</button></div>}
    {loading ? <div className="loading-panel">Loading your dashboard…</div> : data && <>
      <div className="stats-grid">
        <StatCard label="Total users" value={data.stats.totalUsers} icon={Users} tone="blue" note="All registered accounts"/>
        <StatCard label="Active users" value={data.stats.activeUsers} icon={UserCheck} tone="green" note="Currently enabled accounts"/>
        <StatCard label="Administrators" value={data.stats.admins} icon={Shield} tone="purple" note="Admin and super admin roles"/>
        <StatCard label="Inactive users" value={data.stats.inactiveUsers} icon={UserX} tone="orange" note="Accounts currently disabled"/>
      </div>
      <section className="panel"><div className="panel-heading"><div><h2>Recently joined</h2><p>Latest accounts created in your workspace.</p></div><span className="subtle-tag">LATEST 5</span></div>
        {data.recentUsers.length ? <div className="table-wrap"><table><thead><tr><th>USER</th><th>ROLE</th><th>STATUS</th><th>JOINED</th></tr></thead><tbody>
          {data.recentUsers.map(person=><tr key={person.id}><td><div className="person-cell"><div className="avatar">{person.name.charAt(0).toUpperCase()}</div><div><strong>{person.name}</strong><span>{person.email}</span></div></div></td><td><span className="role-pill">{person.role.replace('_',' ')}</span></td><td><span className={`status-pill ${person.status}`}>{person.status}</span></td><td>{new Date(person.createdAt).toLocaleDateString()}</td></tr>)}
        </tbody></table></div> : <div className="empty-state">No users yet.</div>}
      </section>
      <div className="tip-card"><div className="tip-icon"><ArrowUpRight size={19}/></div><div><strong>Your workspace is ready to grow</strong><p>Use User management to create accounts, assign roles and control account status.</p></div></div>
    </>}
  </div>;
}
