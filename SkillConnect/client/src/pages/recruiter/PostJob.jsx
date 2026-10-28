import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import api from '../../services/api';

export default function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', responsibilities: '', job_type: 'full_time', experience_level: 'fresher',
    location: '', is_remote: false, salary_min: '', salary_max: '', openings: 1, application_deadline: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]); // { name, mandatory }
  const [saving, setSaving] = useState(false);

  function addSkill(mandatory) {
    if (!skillInput.trim()) return;
    setSkills((s) => [...s, { name: skillInput.trim(), mandatory }]);
    setSkillInput('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // Resolve skill names to IDs (creating any new ones) via /api/skills/resolve
      let skillIds = [];
      let mandatoryIds = [];
      if (skills.length > 0) {
        const res = await api.post('/skills/resolve', { names: skills.map((s) => s.name) });
        const nameToId = Object.fromEntries(res.data.data.map((s) => [s.name, s.id]));
        skillIds = skills.map((s) => nameToId[s.name]).filter(Boolean);
        mandatoryIds = skills.filter((s) => s.mandatory).map((s) => nameToId[s.name]).filter(Boolean);
      }

      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        openings: Number(form.openings) || 1,
        skill_ids: skillIds,
        mandatory_skill_ids: mandatoryIds
      };

      await api.post('/jobs', payload);
      toast.success('Job posted successfully');
      navigate('/recruiter/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post job');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-900">Post a new job</h1>

      <form onSubmit={handleSubmit} className="card mt-6 space-y-4 p-6">
        <div><label className="label">Job title</label>
          <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>

        <div><label className="label">Description</label>
          <textarea required className="input min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>

        <div><label className="label">Responsibilities</label>
          <textarea className="input min-h-[80px]" value={form.responsibilities} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} /></div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Job type</label>
            <select className="input" value={form.job_type} onChange={(e) => setForm({ ...form, job_type: e.target.value })}>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="internship">Internship</option>
              <option value="remote">Remote</option>
            </select></div>
          <div><label className="label">Experience level</label>
            <select className="input" value={form.experience_level} onChange={(e) => setForm({ ...form, experience_level: e.target.value })}>
              <option value="fresher">Fresher</option>
              <option value="0-1">0-1 years</option>
              <option value="1-3">1-3 years</option>
              <option value="3+">3+ years</option>
            </select></div>
          <div><label className="label">Location</label>
            <input required className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><label className="label">Openings</label>
            <input type="number" min="1" className="input" value={form.openings} onChange={(e) => setForm({ ...form, openings: e.target.value })} /></div>
          <div><label className="label">Salary min (₹/year)</label>
            <input type="number" className="input" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} /></div>
          <div><label className="label">Salary max (₹/year)</label>
            <input type="number" className="input" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} /></div>
          <div><label className="label">Application deadline</label>
            <input type="date" className="input" value={form.application_deadline} onChange={(e) => setForm({ ...form, application_deadline: e.target.value })} /></div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input type="checkbox" checked={form.is_remote} onChange={(e) => setForm({ ...form, is_remote: e.target.checked })} />
          This is a remote position
        </label>

        <div>
          <label className="label">Required skills</label>
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={i} className={`badge ${s.mandatory ? 'bg-ink-50 text-ink-700' : 'bg-amber-50 text-amber-700'}`}>
                {s.name}
                <button type="button" onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}><X size={12} /></button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input className="input" placeholder="e.g. React.js" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} />
            <button type="button" className="btn-secondary shrink-0" onClick={() => addSkill(true)}>Must-have</button>
            <button type="button" className="btn-secondary shrink-0" onClick={() => addSkill(false)}>Nice-to-have</button>
          </div>
        </div>

        <button disabled={saving} className="btn-primary">{saving ? 'Posting...' : 'Post job'}</button>
      </form>
    </div>
  );
}
