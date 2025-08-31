import { useState } from 'react';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/register', form);
      setMsg('Registered! You can log in now.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input name="name" placeholder="Name" value={form.name} onChange={onChange} required />
        <br /><br />
        <input name="email" placeholder="Email" type="email" value={form.email} onChange={onChange} required />
        <br /><br />
        <input name="password" placeholder="Password" type="password" value={form.password} onChange={onChange} required />
        <br /><br />
        <button type="submit">Create account</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
