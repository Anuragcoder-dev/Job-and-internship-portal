import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const STATUS_STYLES = {
  applied: 'bg-ink-50 text-ink-600',
  under_review: 'bg-amber-50 text-amber-700',
  shortlisted: 'bg-teal/10 text-teal',
  interview: 'bg-amber-100 text-amber-700',
  selected: 'bg-teal text-white',
  rejected: 'bg-red-50 text-red-600'
};

const STATUS_LABELS = {
  applied: 'Applied', under_review: 'Under Review', shortlisted: 'Shortlisted',
  interview: 'Interview', selected: 'Selected', rejected: 'Rejected'
};

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/applications/my', { params: statusFilter ? { status: statusFilter } : {} })
      .then((res) => setApplications(res.data.data))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-ink-900">My applications</h1>
        <select className="input w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? (
        <p className="mt-6 text-ink-400">Loading...</p>
      ) : applications.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-500">
          You haven't applied to any jobs yet. <Link to="/jobs" className="font-semibold text-teal">Browse jobs</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {applications.map((a) => (
            <div key={a.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <Link to={`/jobs/${a.job_id}`} className="font-semibold text-ink-900 hover:underline">{a.job_title}</Link>
                <p className="text-sm text-ink-500">{a.company_name} &middot; Applied {new Date(a.applied_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-ink-400">Match: {a.match_score}%</span>
                <span className={`badge ${STATUS_STYLES[a.status]}`}>{STATUS_LABELS[a.status]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
