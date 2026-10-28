import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      const { user, token } = res.data.data;
      login(user, token);
      toast.success('Account created!');
      navigate(user.role === 'student' ? '/student/dashboard' : '/recruiter/dashboard');
    } catch (err) {
      const message = err.response?.data?.message
        || (err.request ? 'Registration service is unavailable. Start the API server and MySQL, then try again.' : null)
        || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 py-10">
      <div className="card w-full max-w-sm p-8">
        <Link to="/" className="font-display text-xl font-bold text-ink-900">Skill<span className="text-amber-600">Connect</span></Link>
        <h1 className="mt-4 text-xl font-semibold text-ink-900">Create your account</h1>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {['student', 'recruiter'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm({ ...form, role: r })}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold capitalize transition ${
                form.role === r ? 'border-teal bg-ink-50 text-ink-900' : 'border-ink-100 text-ink-500'
              }`}
            >
              {r === 'student' ? 'Job seeker' : 'Recruiter'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="label">Full name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required minLength={6} className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account? <Link to="/login" className="font-semibold text-teal">Log in</Link>
        </p>
      </div>
    </div>
  );
}
