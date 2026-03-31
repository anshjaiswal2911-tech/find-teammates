import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Zap, Mail, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';

import Hyperspeed from '../components/Hyperspeed/Hyperspeed';

export function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithLinkedIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      navigate('/match');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);
      alert('Google Login Error: ' + (err.message || 'Unknown error. Check console.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Form */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:py-0 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Link to="/" className="flex items-center gap-2 mb-8 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <span className="font-black text-slate-900 text-2xl tracking-tighter">CollabNest</span>
            </Link>

            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome back</h1>
            <p className="mt-2 text-gray-600 font-medium italic">
              Ready to find your next tech partner?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-gray-400 px-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-lg font-semibold"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-gray-400 px-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all text-lg font-semibold"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 group cursor-pointer">
                <input type="checkbox" className="h-5 w-5 rounded-lg border-gray-200 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest text-xs">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-white font-black text-xl shadow-xl shadow-blue-500/20" disabled={loading}>
              {loading ? 'Entering Hyperdrive...' : 'Sign in 🚀'}
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-gray-400">
                <span className="bg-white px-4">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithGoogle()}
              className="w-full h-14 rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 hover:border-blue-100 transition-all flex items-center justify-center gap-3 text-gray-700 font-bold text-lg"
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google Account
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => loginWithLinkedIn()}
              className="w-full h-14 rounded-2xl border-2 border-gray-100 bg-white hover:bg-gray-50 hover:border-[#0077b5] transition-all flex items-center justify-center gap-3 text-gray-700 font-bold text-lg"
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#0077b5]" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              LinkedIn Account
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400 font-bold">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest text-xs">
              Join the crew for free
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Hyperspeed Animation */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Hyperspeed />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-center text-white px-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Live Pilot Network</span>
          </div>

          <h2 className="text-6xl font-black mb-6 tracking-tighter leading-none italic">
            YOUR FUTURE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">IS AT LIGHTSPEED</span>
          </h2>
          <p className="text-xl text-blue-100/70 font-medium mb-12 tracking-tight max-w-md mx-auto">
            Find the developers who match your frequency and build something legendary.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
            {[
              { value: '10K+', label: 'Pilots' },
              { value: '50K+', label: 'Matches' },
              { value: '2.5K+', label: 'Systems' },
              { value: '85%', label: 'Efficiency' },
            ].map((stat) => (
              <Card key={stat.label} className="bg-white/5 backdrop-blur-xl border-white/10 p-4 rounded-2xl">
                <div className="text-2xl font-black text-white italic">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-300/50">{stat.label}</div>
              </Card>
            ))}
          </div>
        </motion.div>
      </div>
    </div>

  );
}
