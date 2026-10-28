import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';
import api from '../../services/api';

export default function CompanyProfile() {
  const [form, setForm] = useState({ name: '', website: '', industry: '', company_size: '', description: '', location: '' });
  const [logoUrl, setLogoUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/profile').then((res) => {
      const company = res.data.data.companies?.[0];
      if (company) {
        setForm({
          name: company.name || '', website: company.website || '', industry: company.industry || '',
          company_size: company.company_size || '', description: company.description || '', location: company.location || ''
        });
        setLogoUrl(company.logo_url);
      }
    }).finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/recruiter/company', form);
      toast.success('Company profile saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    try {
      await api.post('/recruiter/company/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Logo uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  }

  if (loading) return <p className="text-ink-400">Loading...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">Company profile</h1>

      <label className="card flex cursor-pointer items-center gap-4 p-5">
        <UploadCloud className="text-ink-300" size={24} />
        <div>
          <p className="text-sm font-medium text-ink-700">{logoUrl ? 'Replace company logo' : 'Upload company logo'}</p>
          <p className="text-xs text-ink-400">PNG, JPG, or WEBP &middot; Max 2MB</p>
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
      </label>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div><label className="label">Company name</label>
          <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Website</label>
            <input className="input" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} /></div>
          <div><label className="label">Industry</label>
            <input className="input" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></div>
          <div><label className="label">Company size</label>
            <input className="input" placeholder="e.g. 50-200" value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })} /></div>
          <div><label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
        </div>
        <div><label className="label">Description</label>
          <textarea className="input min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <button disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save company profile'}</button>
      </form>
    </div>
  );
}
