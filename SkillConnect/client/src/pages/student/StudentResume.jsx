import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud, FileText, Download } from 'lucide-react';
import api from '../../services/api';

export default function StudentResume() {
  const [resumes, setResumes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  function loadResumes() {
    return api.get('/profile').then((res) => setResumes(res.data.data.resumes || []));
  }

  useEffect(() => { loadResumes().finally(() => setLoading(false)); }, []);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, DOC, or DOCX files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      await api.post('/profile/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Resume uploaded');
      loadResumes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink-900">Resume</h1>

      <label className="card flex cursor-pointer flex-col items-center gap-2 border-dashed p-10 text-center hover:border-teal">
        <UploadCloud className="text-ink-300" size={32} />
        <p className="font-medium text-ink-700">{uploading ? 'Uploading...' : 'Click to upload your resume'}</p>
        <p className="text-xs text-ink-400">PDF, DOC, or DOCX &middot; Max 5MB</p>
        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} disabled={uploading} />
      </label>

      <div className="card p-6">
        <h2 className="font-semibold text-ink-900">Uploaded resumes</h2>
        {loading ? (
          <p className="mt-3 text-ink-400">Loading...</p>
        ) : resumes.length === 0 ? (
          <p className="mt-3 text-ink-500">No resume uploaded yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {resumes.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg border border-ink-50 px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-ink-700">
                  <FileText size={16} /> {r.file_name} {r.is_primary ? <span className="badge bg-teal/10 text-teal">Primary</span> : null}
                </span>
                <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/profile/resume/${r.id}/download`}
                   target="_blank" rel="noreferrer" className="text-ink-400 hover:text-ink-900">
                  <Download size={16} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
