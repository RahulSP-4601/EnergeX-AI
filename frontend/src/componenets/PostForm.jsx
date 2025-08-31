import { useState } from 'react';
import api from '../api';

export default function PostForm({ onCreated }) {
  const [form, setForm] = useState({ title: '', content: '' });
  const [msg, setMsg] = useState('');

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

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
    <div style={{ margin: '16px 0' }}>
      <h3>New Post</h3>
      <form onSubmit={submit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
          required
          style={{ width: '100%' }}
        />
        <br /><br />
        <textarea
          name="content"
          placeholder="Content"
          value={form.content}
          onChange={onChange}
          required
          rows={4}
          style={{ width: '100%' }}
        />
        <br /><br />
        <button type="submit">Create</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}
