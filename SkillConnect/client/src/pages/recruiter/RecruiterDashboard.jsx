import React, { useEffect, useState } from 'react';
import { Briefcase, Users, CheckCircle2, CalendarClock, Award } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';

export default function RecruiterDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/recruiter/stats').then((res) => setStats(res.data.data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Recruiter dashboard</h1>
        <p className="mt-1 text-ink-500">A snapshot of your job postings and pipeline.</p>
      </div>

      {!stats ? (
        <p className="text-ink-400">Loading stats...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total jobs posted" value={stats.totalJobsPosted} icon={Briefcase} />
          <StatCard label="Active jobs" value={stats.activeJobs} icon={Briefcase} accent="text-teal" />
          <StatCard label="Total applications" value={stats.totalApplications} icon={Users} />
          <StatCard label="Shortlisted" value={stats.shortlisted} icon={CheckCircle2} accent="text-teal" />
          <StatCard label="Interviews" value={stats.interviews} icon={CalendarClock} accent="text-amber-600" />
          <StatCard label="Selected" value={stats.selected} icon={Award} accent="text-teal" />
        </div>
      )}
    </div>
  );
}
