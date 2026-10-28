import React from 'react';

/**
 * MatchRing - the recurring visual signature of SkillConnect.
 * A compact radial progress ring showing the skill-match percentage
 * between a student's profile and a job's required skills.
 */
export default function MatchRing({ score = 0, size = 56 }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 75 ? '#2F6F63' : score >= 45 ? '#D6A419' : '#B45252';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EEF3F1" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="absolute font-mono text-xs font-semibold text-ink-800">{Math.round(score)}%</span>
    </div>
  );
}
