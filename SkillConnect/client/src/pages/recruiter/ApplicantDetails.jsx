import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

export default function ApplicantDetails() {
  const { studentProfileId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/recruiter/applicants/${studentProfileId}`)
      .then((res) => setProfile(res.data.data))
      .finally(() => setLoading(false));
  }, [studentProfileId]);

  if (loading) return <p className="text-ink-400">Loading applicant...</p>;
  if (!profile) return <p className="text-ink-400">Applicant not found.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="card p-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">{profile.name}</h1>
        <p className="mt-1 text-ink-600">{profile.headline}</p>
        <p className="mt-1 text-sm text-ink-500">{profile.email} &middot; {profile.phone} &middot; {profile.location}</p>
        {profile.bio && <p className="mt-4 text-sm text-ink-600">{profile.bio}</p>}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-ink-900">Skills</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.skills?.map((s) => (
            <span key={s.name} className="badge bg-ink-50 text-ink-700">{s.name} &middot; {s.proficiency}</span>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-ink-900">Education</h2>
        <div className="mt-3 space-y-2">
          {profile.education?.map((ed) => (
            <div key={ed.id}>
              <p className="font-medium text-ink-900">{ed.degree} - {ed.institution}</p>
              <p className="text-sm text-ink-500">{ed.start_year} - {ed.end_year || 'Present'}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-ink-900">Experience</h2>
        <div className="mt-3 space-y-2">
          {profile.experience?.map((ex) => (
            <div key={ex.id}>
              <p className="font-medium text-ink-900">{ex.job_title} - {ex.company_name}</p>
              <p className="text-sm text-ink-500">{ex.start_date} - {ex.is_current ? 'Present' : ex.end_date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
