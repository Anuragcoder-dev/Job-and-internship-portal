import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Target, LayoutDashboard, ShieldCheck } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import MatchRing from '../../components/jobs/MatchRing';

export default function Home() {
  return (
    <div>
      <Navbar />

      {/* Hero - the thesis: matching, not just listing */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="mb-4 inline-block rounded-full bg-ink-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal">
            Skill-matched, not just listed
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-ink-900 md:text-5xl">
            Find roles that actually fit your skills.
          </h1>
          <p className="mt-4 max-w-md text-ink-600">
            SkillConnect scores every job against your profile so you spend time on
            applications worth submitting — not scrolling.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary">Create your profile</Link>
            <Link to="/jobs" className="btn-secondary">Browse jobs</Link>
          </div>
        </div>

        {/* Signature element: a stack of match rings representing the scoring engine */}
        <div className="card flex flex-col gap-4 p-6">
          <p className="label">Sample match scores</p>
          {[
            { title: 'Full Stack Developer', company: 'TechCorp Solutions', score: 92 },
            { title: 'Frontend Intern', company: 'TechCorp Solutions', score: 68 },
            { title: 'Backend Developer', company: 'DataWiz Analytics', score: 41 }
          ].map((j) => (
            <div key={j.title} className="flex items-center justify-between gap-4 border-b border-ink-50 pb-4 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-semibold text-ink-900">{j.title}</p>
                <p className="text-xs text-ink-500">{j.company}</p>
              </div>
              <MatchRing score={j.score} size={48} />
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-ink-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="font-display text-2xl font-bold text-ink-900">How SkillConnect works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {[
              { icon: Target, title: 'Build your profile', text: 'Add skills, education, and experience once.' },
              { icon: Search, title: 'Search & filter', text: 'Search by title, skill, company, or location.' },
              { icon: LayoutDashboard, title: 'Get matched', text: 'See a live match percentage on every job.' },
              { icon: ShieldCheck, title: 'Track applications', text: 'Follow every application from applied to selected.' }
            ].map((f) => (
              <div key={f.title} className="card p-5">
                <f.icon className="text-teal" size={22} />
                <p className="mt-3 font-semibold text-ink-900">{f.title}</p>
                <p className="mt-1 text-sm text-ink-500">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-ink-400">
        © {new Date().getFullYear()} SkillConnect. Built as an academic full-stack portfolio project.
      </footer>
    </div>
  );
}
