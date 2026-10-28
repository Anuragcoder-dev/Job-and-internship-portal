import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import api from '../../services/api';

export default function StudentBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    return api.get('/bookmarks').then((res) => setBookmarks(res.data.data));
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  async function handleRemove(jobId) {
    try {
      await api.delete(`/bookmarks/${jobId}`);
      setBookmarks((b) => b.filter((x) => x.job_id !== jobId));
      toast.success('Removed');
    } catch {
      toast.error('Could not remove bookmark');
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Bookmarked jobs</h1>
      {loading ? (
        <p className="mt-6 text-ink-400">Loading...</p>
      ) : bookmarks.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-500">No bookmarks yet.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {bookmarks.map((b) => (
            <div key={b.bookmark_id} className="card flex items-center justify-between gap-3 p-5">
              <div>
                <Link to={`/jobs/${b.job_id}`} className="font-semibold text-ink-900 hover:underline">{b.title}</Link>
                <p className="text-sm text-ink-500">{b.company_name} &middot; {b.location}</p>
              </div>
              <button onClick={() => handleRemove(b.job_id)} className="text-ink-400 hover:text-red-500" aria-label="Remove bookmark">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
