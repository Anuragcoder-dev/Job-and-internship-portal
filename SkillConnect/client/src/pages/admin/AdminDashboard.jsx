import React, { useEffect, useState } from 'react';
import { Users, Briefcase, Building2, FileText, UserCheck, ShieldAlert } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/statistics').then((res) => setStats(res.data.data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Admin dashboard</h1>
        <p className="mt-1 text-ink-500">Platform-wide overview.</p>
      </div>

      {!stats ? (
        <p className="text-ink-400">Loading statistics...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total students" value={stats.totalStudents} icon={Users} />
          <StatCard label="Total recruiters" value={stats.totalRecruiters} icon={UserCheck} />
          <StatCard label="Total companies" value={stats.totalCompanies} icon={Building2} />
          <StatCard label="Total jobs" value={stats.totalJobs} icon={Briefcase} />
          <StatCard label="Active jobs" value={stats.activeJobs} icon={Briefcase} accent="text-teal" />
          <StatCard label="Total applications" value={stats.totalApplications} icon={FileText} />
          <StatCard label="Pending recruiter verification" value={stats.pendingRecruiterVerification} icon={ShieldAlert} accent="text-amber-600" />
        </div>
      )}
    </div>
  );
}
