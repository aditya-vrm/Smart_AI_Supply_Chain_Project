import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative font-sans text-sand">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-purple/20 border border-purple/40 flex items-center justify-center text-purple shadow-[0_0_20px_rgba(139,92,246,0.35)]">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-sand-50">
          Sign In to Supply<span className="text-purple">AI</span>
        </h2>
        <p className="mt-1 text-center text-xs text-sand/65">
          Smart AI-Based Supply Chain and Demand Forecasting System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="glass-card py-8 px-6 shadow-2xl rounded-2xl sm:px-10 relative overflow-hidden">
          {/* Top Purple Accent Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple to-transparent"></div>

          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm placeholder-sand/40 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sand/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 glass-input rounded-xl text-sm placeholder-sand/40 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sand/50 hover:text-sand-50 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-purple" />
                  ) : (
                    <Eye className="w-4 h-4 text-sand/50" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple hover:bg-purple-hover text-white text-sm font-semibold transition-all shadow-lg shadow-purple/30 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-sand/15">
            <div className="p-3 rounded-xl bg-forest-900/70 border border-sand/15 text-xs text-sand/80">
              <span className="font-semibold text-sand-50 block mb-1">Demo Access Credentials:</span>
              <div className="flex justify-between font-mono text-[11px] text-sand/70">
                <span>admin@example.com</span>
                <span className="text-purple-light font-semibold">admin123</span>
              </div>
            </div>
            <div className="mt-4 text-center text-xs text-sand/70">
              Need an account?{' '}
              <Link to="/register" className="text-purple-light hover:text-white font-semibold underline underline-offset-4">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
