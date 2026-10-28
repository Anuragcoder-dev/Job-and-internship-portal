import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/companies').then((res) => setCompanies(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Companies</h1>

      {loading ? (
        <p className="mt-6 text-ink-400">Loading...</p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {companies.map((c) => (
            <div key={c.id} className="card p-5">
              <p className="font-semibold text-ink-900">{c.name}</p>
              <p className="text-sm text-ink-500">{c.industry} &middot; {c.location}</p>
              <p className="mt-2 text-xs text-ink-400">Recruiter: {c.recruiter_name} ({c.recruiter_email})</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
