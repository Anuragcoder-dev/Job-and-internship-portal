import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapPin, Briefcase, IndianRupee, CalendarClock, Bookmark, BookmarkCheck } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const typeLabels = { full_time: 'Full Time', part_time: 'Part Time', internship: 'Internship', remote: 'Remote' };

function formatSalary(min, max) {
  if (!min && !max) return 'Not disclosed';
  const fmt = (n) => `₹${(n / 1000).toFixed(0)}K`;
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  return fmt(min || max);
}

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then((res) => setJob(res.data.data))
      .catch(() => toast.error('Could not load this job'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleApply() {
    if (!user) return navigate('/login');
    if (user.role !== 'student') return toast.error('Only job seekers can apply.');

    setApplying(true);
    try {
      await api.post('/applications', { job_id: Number(id), cover_letter: coverLetter });
      setApplied(true);
      setShowApplyForm(false);
      toast.success('Application submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit application');
    } finally {
      setApplying(false);
    }
  }

  async function handleBookmark() {
    if (!user) return navigate('/login');
    try {
      if (bookmarked) {
        await api.delete(`/bookmarks/${id}`);
        setBookmarked(false);
        toast.success('Removed from bookmarks');
      } else {
        await api.post('/bookmarks', { job_id: Number(id) });
        setBookmarked(true);
        toast.success('Bookmarked');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center text-ink-400">Loading job...</div>;
  if (!job) return <div className="flex h-screen items-center justify-center text-ink-400">Job not found.</div>;

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-4xl px-5 py-8">
        <div className="card p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-900">{job.title}</h1>
              <p className="mt-1 text-ink-600">{job.company_name} &middot; {job.company_location}</p>
            </div>
            <button onClick={handleBookmark} className="btn-secondary shrink-0" aria-label="Bookmark this job">
              {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-500">
            <span className="flex items-center gap-1.5"><MapPin size={15} /> {job.location}{job.is_remote ? ' (Remote)' : ''}</span>
            <span className="flex items-center gap-1.5"><Briefcase size={15} /> {typeLabels[job.job_type]}</span>
            <span className="flex items-center gap-1.5"><IndianRupee size={15} /> {formatSalary(job.salary_min, job.salary_max)}</span>
            {job.application_deadline && (
              <span className="flex items-center gap-1.5"><CalendarClock size={15} /> Apply by {new Date(job.application_deadline).toLocaleDateString()}</span>
            )}
          </div>

          {job.skills?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span key={s.skill_id} className={`badge ${s.is_mandatory ? 'bg-ink-50 text-ink-700' : 'bg-amber-50 text-amber-700'}`}>
                  {s.name}{s.is_mandatory ? '' : ' (nice to have)'}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-ink-100 pt-6">
            <h2 className="font-semibold text-ink-900">Job description</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">{job.description}</p>
          </div>

          {job.responsibilities && (
            <div className="mt-6">
              <h2 className="font-semibold text-ink-900">Responsibilities</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-600">{job.responsibilities}</p>
            </div>
          )}

          <div className="mt-8 border-t border-ink-100 pt-6">
            {applied ? (
              <p className="font-medium text-teal">You've applied to this job. Track it from your dashboard.</p>
            ) : showApplyForm ? (
              <div className="space-y-3">
                <label className="label">Cover letter (optional)</label>
                <textarea className="input min-h-[120px]" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell the recruiter why you're a great fit..." />
                <div className="flex gap-2">
                  <button onClick={handleApply} disabled={applying} className="btn-primary">
                    {applying ? 'Submitting...' : 'Submit application'}
                  </button>
                  <button onClick={() => setShowApplyForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => (user ? setShowApplyForm(true) : navigate('/login'))} className="btn-primary">
                Apply now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
