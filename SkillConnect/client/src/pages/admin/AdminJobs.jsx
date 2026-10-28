import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    return api.get('/admin/jobs').then((res) => setJobs(res.data.data));
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  async function handleRemove(id) {
    if (!confirm('Remove this job posting from the platform?')) return;
    try {
      await api.delete(`/admin/jobs/${id}`);
      toast.success('Job removed');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove job');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Jobs</h1>

      {loading ? (
        <p className="mt-6 text-ink-400">Loading...</p>
      ) : (
        <div className="mt-6 space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold text-ink-900">{j.title}</p>
                <p className="text-sm text-ink-500">{j.company_name} &middot; {j.application_count} applicants</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge bg-ink-50 text-ink-600">{j.status}</span>
                <button onClick={() => handleRemove(j.id)} className="rounded-full p-2 text-ink-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove job">
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
