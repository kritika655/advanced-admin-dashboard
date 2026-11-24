import { useEffect, useState } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, Pencil, Trash2, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const blank = { name: '', email: '', password: '', role: 'user', status: 'active' };

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load(page = 1) {
    try {
      setLoading(true); setError('');
      const { data } = await api.get('/users', { params: { ...filters, page, limit: 8 } });
      setUsers(data.users); setPagination(data.pagination);
    } catch (err) { setError(err.response?.data?.message || 'Could not load users.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { const timer = setTimeout(() => load(1), 300); return () => clearTimeout(timer); }, [filters]);

  function openCreate() { setEditing(null); setForm(blank); setError(''); setModal(true); }
  function openEdit(person) {
    setEditing(person);
    setForm({ name: person.name, email: person.email, password: '', role: person.role, status: person.status });
    setError(''); setModal(true);
  }

  async function submit(e) {
    e.preventDefault(); setError('');
    if (form.name.trim().length < 2) return setError('Name must contain at least 2 characters.');
    if (!editing && form.password.length < 8) return setError('Password must contain at least 8 characters.');
    if (form.password && form.password.length < 8) return setError('New password must contain at least 8 characters.');
    try {
      setSaving(true);
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editing) await api.patch(`/users/${editing.id}`, payload);
      else await api.post('/users', payload);
      setModal(false); setNotice(editing ? 'User updated successfully.' : 'User created successfully.');
      await load(editing ? pagination.page : 1);
    } catch (err) { setError(err.response?.data?.message || 'Could not save user.'); }
    finally { setSaving(false); }
  }

  async function remove(person) {
    if (!window.confirm(`Delete ${person.name}? This cannot be undone.`)) return;
    try { await api.delete(`/users/${person.id}`); setNotice('User deleted successfully.'); await load(Math.min(pagination.page, pagination.totalPages)); }
    catch (err) { setError(err.response?.data?.message || 'Could not delete user.'); }
  }

  const canAssignSuper = currentUser?.role === 'super_admin';
  return <div className="content-stack">
    <div className="page-heading"><div><span className="eyebrow">PEOPLE</span><h1>User management</h1><p>Manage accounts, roles and access to your workspace.</p></div><button className="btn btn-primary" onClick={openCreate}><Plus size={17}/> Add user</button></div>
    {notice && <div className="alert alert-success">{notice}<button className="alert-close" onClick={()=>setNotice('')}><X size={15}/></button></div>}
    {error && !modal && <div className="alert alert-error">{error}<button className="text-button" onClick={()=>load(pagination.page)}>Retry</button></div>}
    <section className="panel">
      <div className="toolbar">
        <div className="search-box"><Search size={17}/><input aria-label="Search users" placeholder="Search by name or email…" value={filters.search} onChange={e=>setFilters({...filters,search:e.target.value})}/></div>
        <select aria-label="Filter by role" value={filters.role} onChange={e=>setFilters({...filters,role:e.target.value})}><option value="">All roles</option><option value="super_admin">Super admin</option><option value="admin">Admin</option><option value="user">User</option></select>
        <select aria-label="Filter by status" value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
      </div>
      {loading ? <div className="loading-panel">Loading users…</div> : users.length ? <div className="table-wrap"><table><thead><tr><th>USER</th><th>ROLE</th><th>STATUS</th><th>JOINED</th><th className="actions-heading">ACTIONS</th></tr></thead><tbody>
        {users.map(person=><tr key={person.id}><td><div className="person-cell"><div className="avatar">{person.name.charAt(0).toUpperCase()}</div><div><strong>{person.name}</strong><span>{person.email}</span></div></div></td><td><span className="role-pill">{person.role.replace('_',' ')}</span></td><td><span className={`status-pill ${person.status}`}>{person.status}</span></td><td>{new Date(person.createdAt).toLocaleDateString()}</td><td><div className="row-actions"><button className="icon-button" title="Edit user" onClick={()=>openEdit(person)}><Pencil size={16}/></button><button className="icon-button danger-icon" title="Delete user" disabled={person.id===currentUser?.id} onClick={()=>remove(person)}><Trash2 size={16}/></button></div></td></tr>)}
      </tbody></table></div> : <div className="empty-state"><UsersEmpty/><strong>No users found</strong><span>Try changing your search or filters.</span></div>}
      <div className="pagination"><span>{pagination.total} total users</span><div><button className="icon-button" disabled={pagination.page<=1 || loading} onClick={()=>load(pagination.page-1)}><ChevronLeft size={17}/></button><span>Page {pagination.page} of {pagination.totalPages}</span><button className="icon-button" disabled={pagination.page>=pagination.totalPages || loading} onClick={()=>load(pagination.page+1)}><ChevronRight size={17}/></button></div></div>
    </section>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false);}}><section className="modal"><div className="modal-heading"><div><span className="eyebrow">{editing ? 'EDIT ACCOUNT' : 'NEW ACCOUNT'}</span><h2>{editing ? 'Update user' : 'Create a user'}</h2></div><button className="icon-button" onClick={()=>setModal(false)}><X/></button></div>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={submit} className="form-stack">
        <label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required minLength={2} maxLength={80}/></label>
        <label>Email address<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label>
        <label>{editing ? 'New password (optional)' : 'Temporary password'}<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength={8} required={!editing} placeholder={editing ? 'Leave blank to keep current password' : 'At least 8 characters'}/></label>
        <div className="form-two"><label>Role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="user">User</option><option value="admin">Admin</option>{canAssignSuper && <option value="super_admin">Super admin</option>}</select></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div>
        <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create user'}</button></div>
      </form>
    </section></div>}
  </div>;
}

function UsersEmpty() { return <div className="empty-icon"><Search size={22}/></div>; }
