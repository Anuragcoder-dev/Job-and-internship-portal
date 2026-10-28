-- =====================================================================
-- SkillConnect - Seed / Sample Data
-- Passwords below are all bcrypt hashes of the plaintext: "Password@123"
-- =====================================================================

USE skillconnect;

-- ---------------- Users ----------------
-- 1 admin, 2 recruiters, 3 students
INSERT INTO users (name, email, password_hash, role, phone, is_active, is_verified) VALUES
('System Admin',   'admin@skillconnect.com',    '$2b$10$examplehashadmin000000000000000000000000000000000000', 'admin',     '9999999999', 1, 1),
('Neha Kapoor',    'neha.recruiter@techcorp.com','$2b$10$examplehashrecruiter100000000000000000000000000000000', 'recruiter', '9876500001', 1, 1),
('Raghav Mehta',   'raghav.recruiter@datawiz.io','$2b$10$examplehashrecruiter200000000000000000000000000000000', 'recruiter', '9876500002', 1, 0),
('Aarav Sharma',   'aarav.student@example.com', '$2b$10$examplehashstudent1000000000000000000000000000000000', 'student',   '9876512345', 1, 1),
('Priya Singh',    'priya.student@example.com', '$2b$10$examplehashstudent2000000000000000000000000000000000', 'student',   '9876523456', 1, 1),
('Karan Verma',    'karan.student@example.com', '$2b$10$examplehashstudent3000000000000000000000000000000000', 'student',   '9876534567', 1, 1);

-- ---------------- Recruiter Profiles ----------------
INSERT INTO recruiter_profiles (user_id, designation, department, is_verified) VALUES
(2, 'HR Manager', 'Talent Acquisition', 1),
(3, 'Technical Recruiter', 'Engineering', 0);

-- ---------------- Companies ----------------
INSERT INTO companies (recruiter_profile_id, name, website, industry, company_size, description, location) VALUES
(1, 'TechCorp Solutions', 'https://techcorp.example.com', 'Information Technology', '500-1000', 'A leading software services company building enterprise products.', 'Bengaluru, India'),
(2, 'DataWiz Analytics', 'https://datawiz.example.io', 'Data & Analytics', '50-200', 'A fast-growing data analytics startup.', 'Pune, India');

-- ---------------- Student Profiles ----------------
INSERT INTO student_profiles (user_id, headline, bio, location, college, degree, graduation_year, experience_level) VALUES
(4, 'Full Stack Developer | MERN & MySQL', 'Final year MCA student passionate about building scalable web apps.', 'Delhi, India', 'Delhi University', 'MCA', 2026, 'fresher'),
(5, 'Frontend Developer | React Enthusiast', 'Loves building clean, accessible user interfaces.', 'Mumbai, India', 'Mumbai University', 'MCA', 2025, '0-1'),
(6, 'Backend Developer | Node.js & Databases', 'Interested in API design and database performance.', 'Chandigarh, India', 'Punjab University', 'M.Sc. CS', 2025, '0-1');

-- ---------------- Skills (master list) ----------------
INSERT INTO skills (name) VALUES
('React.js'), ('JavaScript'), ('Node.js'), ('Express.js'), ('MySQL'),
('HTML5'), ('CSS'), ('Tailwind CSS'), ('MongoDB'), ('Python'),
('Java'), ('REST API'), ('Git'), ('TypeScript'), ('Redux'),
('Data Analysis'), ('SQL'), ('Communication'), ('Problem Solving');

-- ---------------- Student Skills ----------------
INSERT INTO student_skills (student_profile_id, skill_id, proficiency) VALUES
(1, 1, 'advanced'),  (1, 2, 'advanced'), (1, 3, 'intermediate'), (1, 5, 'intermediate'), (1, 13, 'advanced'),
(2, 1, 'expert'),    (2, 2, 'advanced'), (2, 6, 'expert'), (2, 7, 'advanced'), (2, 8, 'intermediate'),
(3, 3, 'advanced'),  (3, 4, 'advanced'), (3, 5, 'advanced'), (3, 12, 'intermediate'), (3, 13, 'intermediate');

-- ---------------- Jobs ----------------
INSERT INTO jobs (company_id, posted_by, title, description, responsibilities, job_type, experience_level, location, is_remote, salary_min, salary_max, openings, status, application_deadline) VALUES
(1, 2, 'Full Stack Developer (MERN)',
 'TechCorp is looking for a Full Stack Developer to build and maintain web applications using React and Node.js.',
 'Develop REST APIs, build React components, write unit tests, collaborate with product team.',
 'full_time', 'fresher', 'Bengaluru, India', 0, 500000, 800000, 3, 'active', '2026-12-31'),

(1, 2, 'Frontend Developer Intern',
 'Internship opportunity for students to work on real-world React projects under mentorship.',
 'Build UI components, fix bugs, write documentation.',
 'internship', 'fresher', 'Bengaluru, India', 1, 15000, 25000, 5, 'active', '2026-10-31'),

(2, 3, 'Backend Developer (Node.js)',
 'DataWiz is hiring a backend developer to design scalable REST APIs backed by MySQL.',
 'Design database schema, build APIs, optimize queries.',
 'full_time', '1-3', 'Pune, India', 0, 700000, 1100000, 2, 'active', '2026-11-30'),

(2, 3, 'Data Analyst - Remote',
 'Remote data analyst role focused on dashboards and reporting.',
 'Build dashboards, write SQL queries, present insights.',
 'remote', '0-1', 'Remote', 1, 400000, 650000, 1, 'active', '2026-12-15');

-- ---------------- Job Skills ----------------
-- Job 1: Full Stack Developer (MERN)
INSERT INTO job_skills (job_id, skill_id, is_mandatory) VALUES
(1, 1, 1), (1, 2, 1), (1, 3, 1), (1, 5, 1), (1, 4, 0);
-- Job 2: Frontend Intern
INSERT INTO job_skills (job_id, skill_id, is_mandatory) VALUES
(2, 1, 1), (2, 2, 1), (2, 6, 1), (2, 7, 1);
-- Job 3: Backend Developer
INSERT INTO job_skills (job_id, skill_id, is_mandatory) VALUES
(3, 3, 1), (3, 4, 1), (3, 5, 1), (3, 12, 1);
-- Job 4: Data Analyst
INSERT INTO job_skills (job_id, skill_id, is_mandatory) VALUES
(4, 16, 1), (4, 17, 1), (4, 10, 0);

-- ---------------- Sample Application ----------------
INSERT INTO applications (student_profile_id, job_id, cover_letter, match_score, status) VALUES
(1, 1, 'I am excited to apply for the Full Stack Developer role at TechCorp.', 80.00, 'under_review'),
(2, 2, 'I would love to intern as a frontend developer.', 75.00, 'shortlisted');

-- ---------------- Bookmarks ----------------
INSERT INTO bookmarks (student_profile_id, job_id) VALUES
(1, 3), (2, 1), (3, 4);

-- ---------------- Notifications ----------------
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(4, 'Application Submitted', 'Your application for Full Stack Developer (MERN) was submitted.', 'application', 0),
(5, 'Application Shortlisted', 'Congratulations! You have been shortlisted for Frontend Developer Intern.', 'application', 0);
