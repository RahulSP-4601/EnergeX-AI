import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Posts from './pages/Posts';

function HomeGate() {
  const { token } = useAuth();
  return token ? <Navigate to="/posts" /> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav style={{ padding: 12, borderBottom: '1px solid #eee' }}>
          <Link to="/register">Register</Link>{' | '}
          <Link to="/login">Login</Link>{' | '}
          <Link to="/posts">Posts</Link>
        </nav>
        <Routes>
          <Route path="/" element={<HomeGate />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/posts" element={<Posts />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
