import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await api.post('/login', form);
      const jwt = res.data.token || res.data.access_token || res.data.jwt || res.data?.data?.token;
      if (!jwt) throw new Error('No token found in response');
      login(jwt);
      navigate('/posts', { replace: true });
    } catch (err) {
      setMsg(err.response?.data?.error || err.message || 'Login failed');
    }
  };

  return (
    <div className="login-wrap">
      <div className="card pad login-card">
        <h2 className="login-title">Login</h2>
        <form className="form" onSubmit={submit}>
          <input className="input" name="email" placeholder="Email" type="email" value={form.email} onChange={onChange} required />
          <input className="input" name="password" placeholder="Password" type="password" value={form.password} onChange={onChange} required />
          <button className="btn btn-primary" type="submit">Login</button>
          {msg && <p className="helper" role="alert">{msg}</p>}
          <div className="auth-switch">No account? <Link to="/register">Create one</Link></div>
        </form>
      </div>
    </div>
  );
}
