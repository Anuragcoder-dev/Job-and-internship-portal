import React, { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import api from '../../services/api';

export default function Interviews() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/recruiter/applicants', { params: { status: 'interview' } })
      .then((res) => setApplicants(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Interviews</h1>
      <p className="mt-1 text-ink-500">Candidates currently in the interview stage.</p>

      {loading ? (
        <p className="mt-6 text-ink-400">Loading...</p>
      ) : applicants.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-500">No interviews scheduled yet.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {applicants.map((a) => (
            <div key={a.application_id} className="card flex items-center gap-4 p-5">
              <CalendarClock className="text-amber-600" size={22} />
              <div>
                <p className="font-semibold text-ink-900">{a.student_name}</p>
                <p className="text-sm text-ink-500">{a.job_title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
