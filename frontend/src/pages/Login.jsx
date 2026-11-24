import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@example.com', password: 'Admin123!' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(e) {
    e.preventDefault(); setError('');
    if (!form.email.trim() || !form.password) return setError('Enter your email and password.');
    try { setBusy(true); await login(form); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Unable to sign in. Check that the API is running.'); }
    finally { setBusy(false); }
  }

  return <div className="auth-page">
    <div className="auth-decoration"><div className="auth-orb orb-one"/><div className="auth-orb orb-two"/><div className="auth-message"><span className="brand-mark"><ShieldCheck size={24}/></span><h1>Clarity for every<br/>part of your business.</h1><p>One workspace to manage your people, permissions and operations.</p></div></div>
    <div className="auth-panel"><div className="auth-form-wrap">
      <div className="brand auth-brand"><span className="brand-mark"><ShieldCheck size={20}/></span><span>AdminFlow</span></div>
      <span className="eyebrow">WELCOME BACK</span><h2>Sign in to your account</h2><p className="muted">Enter your details to access your workspace.</p>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit} className="form-stack">
        <label>Email address<input type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@company.com" required/></label>
        <label>Password<input type="password" autoComplete="current-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Enter your password" required minLength={8}/></label>
        <button className="btn btn-primary btn-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      <div className="demo-credentials"><strong>Local demo account</strong><span>admin@example.com</span><span>Admin123!</span></div>
    </div></div>
  </div>;
}
