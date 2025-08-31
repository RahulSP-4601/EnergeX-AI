import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import PostForm from './../componenets/PostForm';
import { useNavigate } from 'react-router-dom';

export default function Posts() {
  const { token, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [cacheHeader, setCacheHeader] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    (async () => {
      const res = await api.get('/posts');
      setPosts(res.data);
      setCacheHeader(res.headers['x-cache'] || '');
    })();
  }, [token, navigate]);

  const onCreated = (post) => {
    // Optimistic prepend; server also invalidates the list cache.
    setPosts((p) => [post, ...p]);
  };

  return (
    <div style={{ maxWidth: 720, margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>Posts</h2>
        <div>
          {cacheHeader && <small>Cache: {cacheHeader}</small>}{' '}
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <PostForm onCreated={onCreated} />

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {posts.map(p => (
          <li key={p.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 8 }}>
            <h4 style={{ margin: 0 }}>{p.title}</h4>
            <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{p.content}</p>
            <small>ID: {p.id} • User: {p.user_id}</small>
          </li>
        ))}
        {posts.length === 0 && <p>No posts yet.</p>}
      </ul>
    </div>
  );
}
