import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await api.post('/login', form);
      const jwt =
        res.data.token ||
        res.data.access_token ||
        res.data.jwt ||
        res.data?.data?.token; // cover typical shapes

      if (!jwt) {
        throw new Error('No token found in response');
      }

      login(jwt);                           // sets localStorage + context
      navigate('/posts', { replace: true }); // go to posts
    } catch (err) {
      setMsg(
        err.response?.data?.error ||
        err.message ||
        'Login failed'
      );
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input name="email" placeholder="Email" type="email" value={form.email} onChange={onChange} required />
        <br /><br />
        <input name="password" placeholder="Password" type="password" value={form.password} onChange={onChange} required />
        <br /><br />
        <button type="submit">Login</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
