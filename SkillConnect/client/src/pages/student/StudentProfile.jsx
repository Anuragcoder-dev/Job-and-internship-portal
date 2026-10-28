import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';
import api from '../../services/api';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [eduForm, setEduForm] = useState({ institution: '', degree: '', field_of_study: '', start_year: '', end_year: '', grade: '' });
  const [expForm, setExpForm] = useState({ company_name: '', job_title: '', start_date: '', end_date: '', is_current: false, description: '' });

  function loadProfile() {
    return api.get('/profile').then((res) => setProfile(res.data.data));
  }

  useEffect(() => { loadProfile().finally(() => setLoading(false)); }, []);

  async function handleSaveBasics(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', {
        name: profile.name, phone: profile.phone, headline: profile.headline, bio: profile.bio,
        location: profile.location, college: profile.college, degree: profile.degree,
        graduation_year: profile.graduation_year, linkedin_url: profile.linkedin_url,
        github_url: profile.github_url, portfolio_url: profile.portfolio_url, experience_level: profile.experience_level
      });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSkill(e) {
    e.preventDefault();
    if (!newSkill.trim()) return;
    try {
      await api.post('/profile/skills', { skill_name: newSkill.trim() });
      setNewSkill('');
      loadProfile();
      toast.success('Skill added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add skill');
    }
  }

  async function handleRemoveSkill(skillId) {
    await api.delete(`/profile/skills/${skillId}`);
    loadProfile();
  }

  async function handleAddEducation(e) {
    e.preventDefault();
    try {
      await api.post('/profile/education', eduForm);
      setEduForm({ institution: '', degree: '', field_of_study: '', start_year: '', end_year: '', grade: '' });
      loadProfile();
      toast.success('Education added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add education');
    }
  }

  async function handleAddExperience(e) {
    e.preventDefault();
    try {
      await api.post('/profile/experience', expForm);
      setExpForm({ company_name: '', job_title: '', start_date: '', end_date: '', is_current: false, description: '' });
      loadProfile();
      toast.success('Experience added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add experience');
    }
  }

  if (loading || !profile) return <p className="text-ink-400">Loading profile...</p>;

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="font-display text-2xl font-bold text-ink-900">My profile</h1>

      {/* Basic info */}
      <form onSubmit={handleSaveBasics} className="card space-y-4 p-6">
        <h2 className="font-semibold text-ink-900">Basic information</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full name</label>
            <input className="input" value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
          <div><label className="label">Phone</label>
            <input className="input" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Headline</label>
            <input className="input" value={profile.headline || ''} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} /></div>
          <div className="sm:col-span-2"><label className="label">Bio</label>
            <textarea className="input min-h-[80px]" value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></div>
          <div><label className="label">Location</label>
            <input className="input" value={profile.location || ''} onChange={(e) => setProfile({ ...profile, location: e.target.value })} /></div>
          <div><label className="label">Experience level</label>
            <select className="input" value={profile.experience_level || 'fresher'} onChange={(e) => setProfile({ ...profile, experience_level: e.target.value })}>
              <option value="fresher">Fresher</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3+">3+ years</option>
            </select></div>
          <div><label className="label">College</label>
            <input className="input" value={profile.college || ''} onChange={(e) => setProfile({ ...profile, college: e.target.value })} /></div>
          <div><label className="label">Degree</label>
            <input className="input" value={profile.degree || ''} onChange={(e) => setProfile({ ...profile, degree: e.target.value })} /></div>
        </div>
        <button disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save changes'}</button>
      </form>

      {/* Skills */}
      <div className="card p-6">
        <h2 className="font-semibold text-ink-900">Skills</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.skills?.map((s) => (
            <span key={s.id} className="badge bg-ink-50 text-ink-700">
              {s.name}
              <button onClick={() => handleRemoveSkill(s.id)} aria-label={`Remove ${s.name}`}><X size={12} /></button>
            </span>
          ))}
        </div>
        <form onSubmit={handleAddSkill} className="mt-4 flex gap-2">
          <input className="input" placeholder="e.g. React.js" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} />
          <button className="btn-secondary shrink-0"><Plus size={16} /> Add</button>
        </form>
      </div>

      {/* Education */}
      <div className="card p-6">
        <h2 className="font-semibold text-ink-900">Education</h2>
        <div className="mt-3 space-y-3">
          {profile.education?.map((ed) => (
            <div key={ed.id} className="border-b border-ink-50 pb-3 last:border-0">
              <p className="font-medium text-ink-900">{ed.degree} - {ed.institution}</p>
              <p className="text-sm text-ink-500">{ed.start_year} - {ed.end_year || 'Present'} {ed.grade ? `· ${ed.grade}` : ''}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddEducation} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Institution" required value={eduForm.institution} onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })} />
          <input className="input" placeholder="Degree" required value={eduForm.degree} onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })} />
          <input className="input" placeholder="Field of study" value={eduForm.field_of_study} onChange={(e) => setEduForm({ ...eduForm, field_of_study: e.target.value })} />
          <input className="input" placeholder="Grade" value={eduForm.grade} onChange={(e) => setEduForm({ ...eduForm, grade: e.target.value })} />
          <input className="input" type="number" placeholder="Start year" required value={eduForm.start_year} onChange={(e) => setEduForm({ ...eduForm, start_year: e.target.value })} />
          <input className="input" type="number" placeholder="End year" value={eduForm.end_year} onChange={(e) => setEduForm({ ...eduForm, end_year: e.target.value })} />
          <button className="btn-secondary sm:col-span-2 w-fit"><Plus size={16} /> Add education</button>
        </form>
      </div>

      {/* Experience */}
      <div className="card p-6">
        <h2 className="font-semibold text-ink-900">Experience</h2>
        <div className="mt-3 space-y-3">
          {profile.experience?.map((ex) => (
            <div key={ex.id} className="border-b border-ink-50 pb-3 last:border-0">
              <p className="font-medium text-ink-900">{ex.job_title} - {ex.company_name}</p>
              <p className="text-sm text-ink-500">{ex.start_date} - {ex.is_current ? 'Present' : ex.end_date}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddExperience} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Company" required value={expForm.company_name} onChange={(e) => setExpForm({ ...expForm, company_name: e.target.value })} />
          <input className="input" placeholder="Job title" required value={expForm.job_title} onChange={(e) => setExpForm({ ...expForm, job_title: e.target.value })} />
          <input className="input" type="date" required value={expForm.start_date} onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })} />
          <input className="input" type="date" value={expForm.end_date} onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })} disabled={expForm.is_current} />
          <label className="flex items-center gap-2 text-sm text-ink-600 sm:col-span-2">
            <input type="checkbox" checked={expForm.is_current} onChange={(e) => setExpForm({ ...expForm, is_current: e.target.checked })} />
            I currently work here
          </label>
          <textarea className="input sm:col-span-2" placeholder="Description" value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} />
          <button className="btn-secondary sm:col-span-2 w-fit"><Plus size={16} /> Add experience</button>
        </form>
      </div>
    </div>
  );
}
