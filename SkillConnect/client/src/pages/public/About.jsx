import React from 'react';
import Navbar from '../../components/common/Navbar';

export default function About() {
  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-2xl font-bold text-ink-900">About SkillConnect</h1>
        <p className="mt-4 text-ink-600">
          SkillConnect is a smart job and internship portal that connects students, recruiters,
          and administrators on one platform. Instead of just listing jobs, SkillConnect scores
          each opening against a student's own skill profile, so job seekers can prioritize
          applications most likely to match, and recruiters see applicants ranked by fit.
        </p>
        <p className="mt-4 text-ink-600">
          Built with React, Node.js, Express, and MySQL as a full-stack academic portfolio project.
        </p>
      </div>
    </div>
  );
}
