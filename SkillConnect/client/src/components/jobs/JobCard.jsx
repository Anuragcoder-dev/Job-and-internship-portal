import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee } from 'lucide-react';
import MatchRing from './MatchRing';

function formatSalary(min, max) {
  if (!min && !max) return 'Not disclosed';
  const fmt = (n) => `${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  return fmt(min || max);
}

const typeLabels = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  internship: 'Internship',
  remote: 'Remote'
};

export default function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="card flex flex-col gap-3 p-5 transition hover:border-ink-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold text-ink-900">{job.title}</p>
          <p className="mt-0.5 text-sm text-ink-600">{job.company_name}</p>
        </div>
        {typeof job.matchScore === 'number' && <MatchRing score={job.matchScore} />}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink-500">
        <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
        <span className="flex items-center gap-1"><Briefcase size={14} /> {typeLabels[job.job_type] || job.job_type}</span>
        <span className="flex items-center gap-1"><IndianRupee size={14} /> {formatSalary(job.salary_min, job.salary_max)}</span>
      </div>

      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((s) => (
            <span key={s.skill_id} className="badge bg-ink-50 text-ink-600">{s.name}</span>
          ))}
          {job.skills.length > 4 && <span className="badge bg-ink-50 text-ink-400">+{job.skills.length - 4}</span>}
        </div>
      )}
    </Link>
  );
}
