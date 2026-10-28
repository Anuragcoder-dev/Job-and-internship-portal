import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/applications').then((res) => setApplications(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Applications</h1>

      {loading ? (
        <p className="mt-6 text-ink-400">Loading...</p>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 text-ink-400">
              <tr><th className="p-4">Student</th><th className="p-4">Job</th><th className="p-4">Company</th><th className="p-4">Match</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-b border-ink-50 last:border-0">
                  <td className="p-4 font-medium text-ink-900">{a.student_name}</td>
                  <td className="p-4 text-ink-600">{a.job_title}</td>
                  <td className="p-4 text-ink-600">{a.company_name}</td>
                  <td className="p-4 text-ink-600">{a.match_score}%</td>
                  <td className="p-4"><span className="badge bg-ink-50 text-ink-600 capitalize">{a.status.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
