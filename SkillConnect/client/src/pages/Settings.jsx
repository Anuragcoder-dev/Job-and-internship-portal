import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);

  async function handleSaveAccount(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', form);
      toast.success('Account updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>

      <form onSubmit={handleSaveAccount} className="card space-y-4 p-6">
        <h2 className="font-semibold text-ink-900">Account details</h2>
        <div><label className="label">Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <button disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
      </form>

      <div className="card p-6">
        <h2 className="font-semibold text-ink-900">Change password</h2>
        <p className="mt-2 text-sm text-ink-500">
          Use "Forgot password" from the login page to reset your password securely via a reset token.
        </p>
      </div>
    </div>
  );
}
