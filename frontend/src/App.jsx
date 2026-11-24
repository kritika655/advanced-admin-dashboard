import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();
  return <Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route element={<AppLayout/>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route element={<ProtectedRoute roles={['super_admin','admin']}/>}>
          <Route path="/users" element={<Users/>}/>
        </Route>
      </Route>
    </Route>
    <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>;
}
