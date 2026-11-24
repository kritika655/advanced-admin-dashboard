import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;

  async function submit(e) {
    e.preventDefault(); setError('');
    if (form.name.trim().length < 2) return setError('Name must be at least 2 characters.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    try { setBusy(true); await register(form); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.message || 'Could not create your account.'); }
    finally { setBusy(false); }
  }

  return <div className="auth-page register-page"><div className="auth-panel"><div className="auth-form-wrap">
    <div className="brand auth-brand"><span className="brand-mark">A</span><span>AdminFlow</span></div>
    <span className="eyebrow">GET STARTED</span><h2>Create your account</h2><p className="muted">New public accounts receive the standard user role.</p>
    {error && <div className="alert alert-error">{error}</div>}
    <form onSubmit={submit} className="form-stack">
      <label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required minLength={2} maxLength={80} placeholder="Your name"/></label>
      <label>Email address<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required placeholder="you@company.com"/></label>
      <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={8} placeholder="At least 8 characters"/></label>
      <button className="btn btn-primary btn-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
    </form>
    <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
  </div></div></div>;
}
