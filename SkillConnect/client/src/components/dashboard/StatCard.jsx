import React from 'react';

export default function StatCard({ label, value, icon: Icon, accent = 'text-ink-900' }) {
  return (
    <div className="card flex items-center justify-between p-5">
      <div>
        <p className="label">{label}</p>
        <p className={`mt-1 font-display text-2xl font-bold ${accent}`}>{value}</p>
      </div>
      {Icon && <Icon className="text-ink-200" size={28} />}
    </div>
  );
}
