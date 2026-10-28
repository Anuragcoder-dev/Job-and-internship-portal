import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';

export default function AdminReports() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/statistics').then((res) => setStats(res.data.data));
  }, []);

  if (!stats) return <p className="text-ink-400">Loading report...</p>;

  const data = [
    { name: 'Students', value: stats.totalStudents },
    { name: 'Recruiters', value: stats.totalRecruiters },
    { name: 'Companies', value: stats.totalCompanies },
    { name: 'Jobs', value: stats.totalJobs },
    { name: 'Applications', value: stats.totalApplications }
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Platform reports</h1>
      <div className="card mt-6 p-6">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF3F1" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#4B776A' }} />
            <YAxis tick={{ fontSize: 12, fill: '#4B776A' }} />
            <Tooltip />
            <Bar dataKey="value" fill="#2F6F63" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
