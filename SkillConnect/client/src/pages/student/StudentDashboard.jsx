import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, CalendarClock, Award, XCircle } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import JobCard from '../../components/jobs/JobCard';

export default function StudentDashboard() {
  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/applications/my'),
      api.get('/jobs/recommended/me')
    ]).then(([appsRes, jobsRes]) => {
      setApplications(appsRes.data.data);
      setRecommended(jobsRes.data.data.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Your dashboard</h1>
        <p className="mt-1 text-ink-500">A quick look at your applications and top matches.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total applications" value={applications.length} icon={FileText} />
        <StatCard label="Shortlisted" value={counts.shortlisted || 0} icon={CheckCircle2} accent="text-teal" />
        <StatCard label="Interviews" value={counts.interview || 0} icon={CalendarClock} accent="text-amber-600" />
        <StatCard label="Selected" value={counts.selected || 0} icon={Award} accent="text-teal" />
        <StatCard label="Rejected" value={counts.rejected || 0} icon={XCircle} accent="text-red-500" />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink-900">Recommended for you</h2>
          <Link to="/student/recommended" className="text-sm font-semibold text-teal">View all</Link>
        </div>
        {loading ? (
          <p className="mt-4 text-ink-400">Loading recommendations...</p>
        ) : recommended.length === 0 ? (
          <div className="card mt-4 p-6 text-ink-500">Add skills to your profile to get personalized matches.</div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {recommended.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        )}
      </div>
    </div>
  );
}
