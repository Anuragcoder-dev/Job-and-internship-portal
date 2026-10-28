import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import JobCard from '../../components/jobs/JobCard';

export default function StudentRecommended() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/recommended/me').then((res) => setJobs(res.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Recommended for you</h1>
      <p className="mt-1 text-ink-500">Ranked by how closely each job's required skills match your profile.</p>

      {loading ? (
        <p className="mt-6 text-ink-400">Calculating matches...</p>
      ) : jobs.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-500">
          Add more skills to your profile to unlock personalized recommendations.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}
