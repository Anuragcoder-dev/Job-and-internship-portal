import React, { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import JobCard from '../../components/jobs/JobCard';
import api from '../../services/api';

const JOB_TYPES = [
  { value: '', label: 'All types' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' }
];

const EXPERIENCE_LEVELS = [
  { value: '', label: 'Any experience' },
  { value: 'fresher', label: 'Fresher' },
  { value: '0-1', label: '0-1 years' },
  { value: '1-3', label: '1-3 years' },
  { value: '3+', label: '3+ years' }
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'salary_high', label: 'Salary: High to Low' },
  { value: 'salary_low', label: 'Salary: Low to High' }
];

export default function Jobs() {
  const [filters, setFilters] = useState({
    search: '', location: '', job_type: '', experience_level: '', sort: 'latest', page: 1
  });
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await api.get('/jobs', { params });
      setJobs(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-7xl px-5 py-8">
        <h1 className="font-display text-2xl font-bold text-ink-900">Browse jobs & internships</h1>

        {/* Search bar */}
        <div className="mt-5 flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2.5 shadow-card">
          <Search size={18} className="text-ink-400" />
          <input
            className="w-full border-0 bg-transparent text-sm outline-none"
            placeholder="Search by title, skill, or company"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
          {/* Filter sidebar */}
          <aside className="card h-fit space-y-5 p-5">
            <div>
              <label className="label">Location</label>
              <input className="input" placeholder="City or Remote" value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)} />
            </div>
            <div>
              <label className="label">Job type</label>
              <select className="input" value={filters.job_type} onChange={(e) => updateFilter('job_type', e.target.value)}>
                {JOB_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Experience</label>
              <select className="input" value={filters.experience_level} onChange={(e) => updateFilter('experience_level', e.target.value)}>
                {EXPERIENCE_LEVELS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sort by</label>
              <select className="input" value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </aside>

          {/* Results */}
          <div>
            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[...Array(4)].map((_, i) => <div key={i} className="card h-40 animate-pulse bg-ink-50" />)}
              </div>
            ) : jobs.length === 0 ? (
              <div className="card p-10 text-center text-ink-500">No jobs match your filters yet. Try widening your search.</div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {jobs.map((job) => <JobCard key={job.id} job={job} />)}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button disabled={pagination.page <= 1} className="btn-secondary"
                      onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}>Previous</button>
                    <span className="text-sm text-ink-500">Page {pagination.page} of {pagination.totalPages}</span>
                    <button disabled={pagination.page >= pagination.totalPages} className="btn-secondary"
                      onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}>Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
