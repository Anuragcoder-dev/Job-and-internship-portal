import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    return api.get('/notifications').then((res) => setNotifications(res.data.data));
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  async function markAllRead() {
    await api.put('/notifications/read-all');
    load();
  }

  async function markRead(id) {
    await api.put(`/notifications/${id}/read`);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink-900">Notifications</h1>
        <button onClick={markAllRead} className="btn-secondary"><CheckCheck size={16} /> Mark all as read</button>
      </div>

      {loading ? (
        <p className="mt-6 text-ink-400">Loading...</p>
      ) : notifications.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-ink-500">You're all caught up.</div>
      ) : (
        <div className="mt-6 space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`card flex w-full items-start gap-3 p-4 text-left ${n.is_read ? 'opacity-60' : ''}`}
            >
              <Bell size={16} className="mt-0.5 shrink-0 text-teal" />
              <div>
                <p className="font-medium text-ink-900">{n.title}</p>
                <p className="text-sm text-ink-500">{n.message}</p>
                <p className="mt-1 text-xs text-ink-400">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
