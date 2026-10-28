import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Users, Pencil, Trash2 } from 'lucide-react';
import api from '../../services/api';

const STATUS_STYLES = { active: 'bg-teal/10 text-teal', inactive: 'bg-ink-50 text-ink-500', closed: 'bg-red-50 text-red-600' };

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    return api.get('/recruiter/jobs').then((res) => setJobs(res.data.data));
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  async function toggleStatus(job) {
    const next = job.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/jobs/${job.id}/status`, { status: next });
      toast.success(`Job marked as ${next}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      await api.delete(`/jobs/${id}`);
      toast.success('Job deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete job');
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Manage jobs</h1>
        <Link to="/recruiter/post-job" className="btn-primary">Post new job</Link>
      </div>

      {loading ? (
        <p className="mt-6 text-ink-400">Loading...</p>
      ) : jobs.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-500">You haven't posted any jobs yet.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold text-ink-900">{job.title}</p>
                <p className="text-sm text-ink-500">{job.application_count} applicant{job.application_count !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${STATUS_STYLES[job.status]}`}>{job.status}</span>
                <Link to={`/recruiter/applicants?job_id=${job.id}`} className="btn-secondary"><Users size={14} /> Applicants</Link>
                <button onClick={() => toggleStatus(job)} className="btn-secondary">
                  {job.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => handleDelete(job.id)} className="rounded-full p-2 text-ink-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete job">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
