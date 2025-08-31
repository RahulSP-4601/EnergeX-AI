import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import PostForm from './../componenets/PostForm';
import './Posts.css';

export default function Posts() {
  const { token, logout } = useAuth();

  const [posts, setPosts] = useState([]);
  const [lastAllCache, setLastAllCache] = useState('');
  const [singleId, setSingleId] = useState('');
  const [singlePost, setSinglePost] = useState(null);
  const [lastSingleCache, setLastSingleCache] = useState('');
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingOne, setLoadingOne] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchAll() {
    setLoadingAll(true);
    setError('');
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
      setLastAllCache(res.headers['x-cache'] || res.headers['x-cache-status'] || '');
    } catch (e) {
      setError(e.response?.data?.message || e.response?.data?.error || 'Failed to fetch posts');
    } finally {
      setLoadingAll(false);
    }
  }

  async function fetchOne() {
    if (!singleId) return;
    setLoadingOne(true);
    setError('');
    try {
      const res = await api.get(`/posts/${singleId}`);
      setSinglePost(res.data);
      setLastSingleCache(res.headers['x-cache'] || res.headers['x-cache-status'] || '');
    } catch (e) {
      setSinglePost(null);
      setError(e.response?.data?.message || e.response?.data?.error || 'Failed to fetch post');
    } finally {
      setLoadingOne(false);
    }
  }

  const onCreated = (post) => setPosts((p) => [post, ...p]);

  return (
    <div className="posts-wrap">
      <header className="posts-header">
        <h2>Posts</h2>
        <div className="cache-group">
          {lastAllCache && <span className="badge">All: <strong style={{color: /hit/i.test(lastAllCache) ? 'var(--ok)' : 'var(--danger)'}}>{lastAllCache}</strong></span>}
          {lastSingleCache && <span className="badge">Single: <strong style={{color: /hit/i.test(lastSingleCache) ? 'var(--ok)' : 'var(--danger)'}}>{lastSingleCache}</strong></span>}
          <button className="btn btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      {error && <p className="helper" style={{color: 'var(--danger)'}}>{error}</p>}

      <section className="card panel">
        <h3 style={{marginTop: 0}}>New Post</h3>
        <PostForm onCreated={onCreated} />
      </section>

      <section className="card panel" style={{marginTop: 16}}>
        <div className="row" style={{flexWrap: 'wrap'}}>
          <button className="btn btn-primary" onClick={fetchAll} disabled={loadingAll}>
            {loadingAll ? 'Loading…' : 'Fetch All Posts'}
          </button>

          <div className="row">
            <input className="input" placeholder="Post ID" value={singleId} onChange={(e) => setSingleId(e.target.value)} style={{ width: 160 }} />
            <button className="btn btn-ghost" onClick={fetchOne} disabled={loadingOne || !singleId}>
              {loadingOne ? 'Loading…' : 'Fetch Single'}
            </button>
          </div>
        </div>

        {singlePost && (
          <div className="card post-item" style={{marginTop: 12}}>
            <strong>Single Post</strong>
            <h4 style={{ margin: '8px 0 0' }}>{singlePost.title}</h4>
            <p style={{ marginTop: 6 }} className="post-body">{singlePost.content}</p>
            <span className="post-meta">ID: {singlePost.id} • User: {singlePost.user_id}</span>
          </div>
        )}
      </section>

      <ul className="list" style={{marginTop: 16}}>
        {posts.map((p) => (
          <li key={p.id} className="card post-item">
            <h4>{p.title}</h4>
            <p className="post-body">{p.content}</p>
            <span className="post-meta">ID: {p.id} • User: {p.user_id}</span>
          </li>
        ))}
        {posts.length === 0 && !loadingAll && <p className="helper">No posts yet.</p>}
      </ul>
    </div>
  );
}
