import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <>
      <div className="background-overlay"></div>
      <div className="login-card">
        <img src="/logo.png" alt="App Logo" className="login-logo" />
        <div className="login-title">Chama Pamoja</div>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#555', fontWeight: 500 }}>
          Manage Your Group Finances Effortlessly
        </div>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {error && (
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 text-rose-600 px-5 py-4 rounded-2xl text-sm font-medium border border-rose-100/50 flex items-center gap-3 mb-4">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            style={{ marginBottom: '1rem' }}
          />
          <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
            <input
              className="input pr-12"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a78bfa' }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#666' }}>
              <input type="checkbox" style={{ marginRight: 4 }} /> Remember me
            </label>
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={22} className="animate-spin" /> Signing in...
              </>
            ) : (
              <>Login</>
            )}
          </button>
        </form>
        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 14, color: '#666' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#7c3aed', fontWeight: 600 }}>Create one</Link>
        </div>
        <div style={{ marginTop: '1.5rem', padding: 16, background: 'rgba(243, 232, 255, 0.5)', borderRadius: 16, fontSize: 12, color: '#666', textAlign: 'center' }}>
          <span style={{ fontSize: 16, marginRight: 6 }}>💡</span>
          <strong>Demo:</strong> Use any email and password to login
        </div>
      </div>
    </>
  );
}
