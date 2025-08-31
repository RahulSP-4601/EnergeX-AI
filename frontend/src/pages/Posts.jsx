import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import PostForm from './../componenets/PostForm';

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

  // Only fetch when a token exists; routing already guarantees we're authed
  useEffect(() => {
    if (!token) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // token in deps so a new login triggers fetch

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

  const onCreated = (post) => {
    // Optimistic prepend; backend should also invalidate Redis list cache
    setPosts((p) => [post, ...p]);
    // Optionally: fetchAll(); // to see new X-Cache header status
  };

  return (
    <div style={{ maxWidth: 820, margin: '40px auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Posts</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {lastAllCache && <CacheBadge label="All" value={lastAllCache} />}
          {lastSingleCache && <CacheBadge label="Single" value={lastSingleCache} />}
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <section style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>New Post</h3>
        <PostForm onCreated={onCreated} />
      </section>

      <section style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={fetchAll} disabled={loadingAll}>
            {loadingAll ? 'Loading…' : 'Fetch All Posts'}
          </button>

          <div>
            <input
              placeholder="Post ID"
              value={singleId}
              onChange={(e) => setSingleId(e.target.value)}
              style={{ width: 120, marginRight: 8 }}
            />
            <button onClick={fetchOne} disabled={loadingOne || !singleId}>
              {loadingOne ? 'Loading…' : 'Fetch Single'}
            </button>
          </div>
        </div>

        {singlePost && (
          <div style={{ marginTop: 12, padding: 12, border: '1px solid #ddd', borderRadius: 8, background: '#fafafa' }}>
            <strong>Single Post</strong>
            <h4 style={{ margin: '8px 0 0' }}>{singlePost.title}</h4>
            <p style={{ marginTop: 6, whiteSpace: 'pre-wrap' }}>{singlePost.content}</p>
            <small>ID: {singlePost.id} • User: {singlePost.user_id}</small>
          </div>
        )}
      </section>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {posts.map((p) => (
          <li key={p.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 8 }}>
            <h4 style={{ margin: 0 }}>{p.title}</h4>
            <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{p.content}</p>
            <small>ID: {p.id} • User: {p.user_id}</small>
          </li>
        ))}
        {posts.length === 0 && !loadingAll && <p>No posts yet.</p>}
      </ul>
    </div>
  );
}

function CacheBadge({ label, value }) {
  const color =
    /hit/i.test(value) ? '#2e7d32' :
    /miss/i.test(value) ? '#c62828' :
    '#6d6d6d';
  return (
    <span style={{
      fontSize: 12,
      padding: '4px 8px',
      borderRadius: 12,
      background: '#f3f3f3',
      border: '1px solid #e0e0e0',
      color,
    }}>
      {label}: {value}
    </span>
  );
}
