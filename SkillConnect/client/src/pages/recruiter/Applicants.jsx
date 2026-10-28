import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Download, CalendarClock } from 'lucide-react';
import api from '../../services/api';
import MatchRing from '../../components/jobs/MatchRing';

const STATUS_OPTIONS = ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'];
const STATUS_LABELS = {
  applied: 'Applied', under_review: 'Under Review', shortlisted: 'Shortlisted',
  interview: 'Interview', selected: 'Selected', rejected: 'Rejected'
};

export default function Applicants() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('job_id');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(null); // application_id being scheduled
  const [interviewForm, setInterviewForm] = useState({ scheduled_at: '', mode: 'online', location_or_link: '' });

  function load() {
    return api.get('/recruiter/applicants', { params: jobId ? { job_id: jobId } : {} })
      .then((res) => setApplicants(res.data.data));
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, [jobId]);

  async function updateStatus(applicationId, status) {
    try {
      await api.put(`/applications/${applicationId}/status`, { status });
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status');
    }
  }

  async function handleScheduleInterview(e) {
    e.preventDefault();
    try {
      await api.post('/recruiter/interviews', { application_id: scheduling, ...interviewForm });
      toast.success('Interview scheduled');
      setScheduling(null);
      setInterviewForm({ scheduled_at: '', mode: 'online', location_or_link: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not schedule interview');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Applicants</h1>
      <p className="mt-1 text-ink-500">Ranked by skill-match score, highest first.</p>

      {loading ? (
        <p className="mt-6 text-ink-400">Loading...</p>
      ) : applicants.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-500">No applicants yet for this filter.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {applicants.map((a) => (
            <div key={a.application_id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <MatchRing score={a.match_score || 0} size={48} />
                  <div>
                    <Link to={`/recruiter/applicants/${a.student_profile_id}`} className="font-semibold text-ink-900 hover:underline">
                      {a.student_name}
                    </Link>
                    <p className="text-sm text-ink-500">{a.job_title} &middot; {a.headline || 'No headline'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {a.resume_id && (
                    <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/profile/resume/${a.resume_id}/download`}
                       target="_blank" rel="noreferrer" className="btn-secondary">
                      <Download size={14} /> Resume
                    </a>
                  )}
                  <button onClick={() => setScheduling(a.application_id)} className="btn-secondary">
                    <CalendarClock size={14} /> Interview
                  </button>
                  <select
                    className="input w-40"
                    value={a.status}
                    onChange={(e) => updateStatus(a.application_id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
              </div>

              {scheduling === a.application_id && (
                <form onSubmit={handleScheduleInterview} className="mt-4 grid gap-3 border-t border-ink-50 pt-4 sm:grid-cols-3">
                  <input type="datetime-local" required className="input" value={interviewForm.scheduled_at}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_at: e.target.value })} />
                  <select className="input" value={interviewForm.mode} onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                    <option value="phone">Phone</option>
                  </select>
                  <input className="input" placeholder="Link or location" value={interviewForm.location_or_link}
                    onChange={(e) => setInterviewForm({ ...interviewForm, location_or_link: e.target.value })} />
                  <div className="flex gap-2 sm:col-span-3">
                    <button className="btn-primary">Confirm interview</button>
                    <button type="button" onClick={() => setScheduling(null)} className="btn-secondary">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
