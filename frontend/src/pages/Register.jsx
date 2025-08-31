import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Register.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

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
    <div className="register-wrap">
      <div className="card pad register-card">
        <h2>Register</h2>
        <form className="form" onSubmit={submit}>
          <input className="input" name="name" placeholder="Name" value={form.name} onChange={onChange} required />
          <input className="input" name="email" placeholder="Email" type="email" value={form.email} onChange={onChange} required />
          <input className="input" name="password" placeholder="Password" type="password" value={form.password} onChange={onChange} required />
          <button className="btn btn-primary" type="submit">Create account</button>
          {msg && <p className="helper">{msg}</p>}
          <div className="auth-switch">Already have an account? <Link to="/login">Login</Link></div>
        </form>
      </div>
    </div>
  );
}
