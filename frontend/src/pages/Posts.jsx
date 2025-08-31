// src/pages/Posts.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import PostForm from './../componenets/PostForm';
import './Posts.css';

export default function Posts() {
  const { token, logout } = useAuth();

  const [posts, setPosts] = useState([]);
  const [singleId, setSingleId] = useState('');
  const [singlePost, setSinglePost] = useState(null);

  const [lastAllCache, setLastAllCache] = useState('');
  const [lastSingleCache, setLastSingleCache] = useState('');
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadingOne, setLoadingOne] = useState(false);
  const [error, setError] = useState('');

  // Clear both lists initially (only show after explicit fetch)
  useEffect(() => {
    setPosts([]);
    setSinglePost(null);
  }, [token]);

  async function fetchAll() {
    setLoadingAll(true);
    setError('');
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
      setSinglePost(null); // clear single view
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
      setPosts([]); // clear list view
      setLastSingleCache(res.headers['x-cache'] || res.headers['x-cache-status'] || '');
    } catch (e) {
      setSinglePost(null);
      setError(e.response?.data?.message || e.response?.data?.error || 'Failed to fetch post');
    } finally {
      setLoadingOne(false);
    }
  }

  const onCreated = (post) => {
    // After creating, default to showing only that post
    setSinglePost(post);
    setPosts([]);
  };

  return (
    <div className="posts-wrap">
      <header className="posts-header">
        <h2>Posts</h2>
        <div className="cache-group">
          {lastAllCache && <span className="badge">All: {lastAllCache}</span>}
          {lastSingleCache && <span className="badge">Single: {lastSingleCache}</span>}
          <button className="btn btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>

      {error && <p className="helper" style={{color: 'var(--danger)'}}>{error}</p>}

      {/* New post form always visible */}
      <section className="card panel">
        <h3 style={{marginTop: 0}}>New Post</h3>
        <PostForm onCreated={onCreated} />
      </section>

      {/* Fetch controls */}
      <section className="card panel" style={{marginTop: 16}}>
        <div className="row" style={{flexWrap: 'wrap', gap: 12}}>
          <button className="btn btn-primary" onClick={fetchAll} disabled={loadingAll}>
            {loadingAll ? 'Loading…' : 'Fetch All Posts'}
          </button>
          <input
            className="input"
            placeholder="Post ID"
            value={singleId}
            onChange={(e) => setSingleId(e.target.value)}
            style={{ width: 160 }}
          />
          <button className="btn btn-ghost" onClick={fetchOne} disabled={loadingOne || !singleId}>
            {loadingOne ? 'Loading…' : 'Fetch Single'}
          </button>
        </div>
      </section>

      {/* Exclusive view area */}
      {singlePost && (
        <div className="card post-item" style={{marginTop: 16}}>
          <strong>Single Post</strong>
          <h4 style={{ margin: '8px 0 0' }}>{singlePost.title}</h4>
          <p className="post-body">{singlePost.content}</p>
          <span className="post-meta">ID: {singlePost.id} • User: {singlePost.user_id}</span>
        </div>
      )}

      {posts.length > 0 && (
        <ul className="list" style={{marginTop: 16}}>
          {posts.map((p) => (
            <li key={p.id} className="card post-item">
              <h4>{p.title}</h4>
              <p className="post-body">{p.content}</p>
              <span className="post-meta">ID: {p.id} • User: {p.user_id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
