import { useState } from 'react';
import api from '../api';
import './PostForm.css';

export default function PostForm({ onCreated }) {
  const [form, setForm] = useState({ title: '', content: '' });
  const [msg, setMsg] = useState('');

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await api.post('/posts', form);
      setForm({ title: '', content: '' });
      setMsg('Post created!');
      onCreated?.(res.data.post);
    } catch (err) {
      setMsg(err.response?.data?.message || err.response?.data?.error || 'Create failed');
    }
  };

  return (
    <form className="postform" onSubmit={submit}>
      <input className="input" name="title" placeholder="Title" value={form.title} onChange={onChange} required />
      <textarea className="textarea" name="content" placeholder="Content" value={form.content} onChange={onChange} required rows={5} />
      <div className="postform-actions">
        <button className="btn btn-primary" type="submit">Create</button>
        {msg && <span className="helper">{msg}</span>}
      </div>
    </form>
  );
}
