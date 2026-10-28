import React from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  LayoutDashboard, User, FileText, Bookmark, Sparkles, Bell, Settings as SettingsIcon,
  Briefcase, Building2, Users2, CalendarClock, BarChart3, ShieldCheck
} from 'lucide-react';

import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Public pages
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import Jobs from './pages/public/Jobs';
import JobDetails from './pages/public/JobDetails';
import Companies from './pages/public/Companies';
import About from './pages/public/About';

// Shared
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentResume from './pages/student/StudentResume';
import StudentApplications from './pages/student/StudentApplications';
import StudentBookmarks from './pages/student/StudentBookmarks';
import StudentRecommended from './pages/student/StudentRecommended';

// Recruiter pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import CompanyProfile from './pages/recruiter/CompanyProfile';
import PostJob from './pages/recruiter/PostJob';
import ManageJobs from './pages/recruiter/ManageJobs';
import Applicants from './pages/recruiter/Applicants';
import ApplicantDetails from './pages/recruiter/ApplicantDetails';
import Interviews from './pages/recruiter/Interviews';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminRecruiters from './pages/admin/AdminRecruiters';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminJobs from './pages/admin/AdminJobs';
import AdminApplications from './pages/admin/AdminApplications';
import AdminReports from './pages/admin/AdminReports';

const studentNav = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/profile', label: 'My Profile', icon: User },
  { to: '/student/resume', label: 'Resume', icon: FileText },
  { to: '/student/applications', label: 'Applications', icon: FileText },
  { to: '/student/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/student/recommended', label: 'Recommended', icon: Sparkles },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/settings', label: 'Settings', icon: SettingsIcon }
];

const recruiterNav = [
  { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/recruiter/company', label: 'Company Profile', icon: Building2 },
  { to: '/recruiter/post-job', label: 'Post Job', icon: Briefcase },
  { to: '/recruiter/jobs', label: 'Manage Jobs', icon: Briefcase },
  { to: '/recruiter/applicants', label: 'Applicants', icon: Users2 },
  { to: '/recruiter/interviews', label: 'Interviews', icon: CalendarClock },
  { to: '/recruiter/notifications', label: 'Notifications', icon: Bell },
  { to: '/recruiter/settings', label: 'Settings', icon: SettingsIcon }
];

const adminNav = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users2 },
  { to: '/admin/recruiters', label: 'Recruiters', icon: ShieldCheck },
  { to: '/admin/companies', label: 'Companies', icon: Building2 },
  { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/admin/applications', label: 'Applications', icon: FileText },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: SettingsIcon }
];

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/companies" element={<Companies />} />
      <Route path="/about" element={<About />} />

      {/* Student routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <DashboardLayout navItems={studentNav} roleLabel="Student" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="resume" element={<StudentResume />} />
        <Route path="applications" element={<StudentApplications />} />
        <Route path="bookmarks" element={<StudentBookmarks />} />
        <Route path="recommended" element={<StudentRecommended />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Recruiter routes */}
      <Route path="/recruiter" element={
        <ProtectedRoute allowedRoles={['recruiter']}>
          <DashboardLayout navItems={recruiterNav} roleLabel="Recruiter" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<RecruiterDashboard />} />
        <Route path="company" element={<CompanyProfile />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="jobs" element={<ManageJobs />} />
        <Route path="applicants" element={<Applicants />} />
        <Route path="applicants/:studentProfileId" element={<ApplicantDetails />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <DashboardLayout navItems={adminNav} roleLabel="Admin" />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="recruiters" element={<AdminRecruiters />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="applications" element={<AdminApplications />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
