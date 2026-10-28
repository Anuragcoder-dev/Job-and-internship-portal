import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Public companies list derives from active jobs' companies
    api.get('/jobs', { params: { limit: 50 } })
      .then((res) => {
        const map = new Map();
        res.data.data.forEach((j) => {
          if (!map.has(j.company_id)) map.set(j.company_id, { id: j.company_id, name: j.company_name, logo_url: j.logo_url, jobCount: 0 });
          map.get(j.company_id).jobCount += 1;
        });
        setCompanies([...map.values()]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-ink-900">Companies hiring now</h1>
        {loading ? (
          <p className="mt-6 text-ink-400">Loading...</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {companies.map((c) => (
              <Link key={c.id} to={`/jobs?company=${encodeURIComponent(c.name)}`} className="card p-5 hover:border-ink-200">
                <p className="font-semibold text-ink-900">{c.name}</p>
                <p className="mt-1 text-sm text-ink-500">{c.jobCount} open role{c.jobCount !== 1 ? 's' : ''}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
