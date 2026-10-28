import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminRecruiters() {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    return api.get('/admin/recruiters').then((res) => setRecruiters(res.data.data));
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  async function verify(id) {
    try {
      await api.put(`/admin/recruiters/${id}/verify`);
      toast.success('Recruiter verified');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not verify recruiter');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Recruiters</h1>

      {loading ? (
        <p className="mt-6 text-ink-400">Loading...</p>
      ) : (
        <div className="mt-6 space-y-3">
          {recruiters.map((r) => (
            <div key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold text-ink-900">{r.name}</p>
                <p className="text-sm text-ink-500">{r.email} &middot; {r.company_name || 'No company yet'}</p>
              </div>
              <span className={`badge ${r.is_verified ? 'bg-teal/10 text-teal' : 'bg-amber-50 text-amber-700'}`}>
                {r.is_verified ? 'Verified' : 'Pending verification'}
              </span>
              {!r.is_verified && (
                <button onClick={() => verify(r.id)} className="btn-primary">Verify recruiter</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
