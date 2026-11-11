import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

// TESTING ONLY — remove this block (and the panel that renders it below)
// before handing the app to real users. Update these to whatever accounts
// you actually created with scripts/createUser.js.
const DEMO_ACCOUNTS = [
  { label: 'Admin', username: 'admin', password: 'supersecret' },
  { label: 'Cashier', username: 'cashier1', password: 'mypassword' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(username, password);
      navigate(user.role === 'admin' ? '/admin' : '/cashier', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-background login-screen">
      <motion.div
        className="glass-panel login-card"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="login-brand">
          <span className="login-brand-badge">🖨️</span>
          <h1>Print Shop</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && (
            <motion.p
              className="login-error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className="login-submit"
            disabled={submitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </motion.button>
        </form>

        <p className="login-footnote">Cashiers and admins both sign in here.</p>

        <div className="demo-panel">
          <p className="demo-title">Testing credentials</p>
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.username}
              type="button"
              className="demo-account"
              onClick={() => {
                setUsername(acc.username);
                setPassword(acc.password);
              }}
            >
              <span className="demo-role">{acc.label}</span>
              <span className="demo-creds">{acc.username} / {acc.password}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}