-- =====================================================================
-- SkillConnect - Smart Job & Internship Portal
-- MySQL Schema (production-normalized, InnoDB, utf8mb4)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS skillconnect
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE skillconnect;

SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. users  (base identity table for all roles)
-- ---------------------------------------------------------------------
CREATE TABLE users (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120)  NOT NULL,
  email           VARCHAR(190)  NOT NULL,
  password_hash   VARCHAR(255)  NOT NULL,
  role            ENUM('student','recruiter','admin') NOT NULL DEFAULT 'student',
  phone           VARCHAR(20)   NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  is_verified     TINYINT(1)    NOT NULL DEFAULT 0,
  reset_token     VARCHAR(255)  NULL,
  reset_token_expires DATETIME  NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 2. student_profiles
-- ---------------------------------------------------------------------
CREATE TABLE student_profiles (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  headline        VARCHAR(150) NULL,
  bio             TEXT NULL,
  location        VARCHAR(120) NULL,
  college         VARCHAR(150) NULL,
  degree          VARCHAR(120) NULL,
  graduation_year YEAR NULL,
  profile_photo   VARCHAR(255) NULL,
  linkedin_url    VARCHAR(255) NULL,
  github_url      VARCHAR(255) NULL,
  portfolio_url   VARCHAR(255) NULL,
  experience_level ENUM('fresher','0-1','1-3','3+') NOT NULL DEFAULT 'fresher',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_user (user_id),
  CONSTRAINT fk_student_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 3. recruiter_profiles
-- ---------------------------------------------------------------------
CREATE TABLE recruiter_profiles (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  designation     VARCHAR(120) NULL,
  department      VARCHAR(120) NULL,
  is_verified     TINYINT(1) NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_recruiter_user (user_id),
  CONSTRAINT fk_recruiter_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 4. companies
-- ---------------------------------------------------------------------
CREATE TABLE companies (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recruiter_profile_id INT UNSIGNED NOT NULL,
  name            VARCHAR(150) NOT NULL,
  website         VARCHAR(255) NULL,
  industry        VARCHAR(120) NULL,
  company_size    VARCHAR(50)  NULL,
  logo_url        VARCHAR(255) NULL,
  description     TEXT NULL,
  location        VARCHAR(150) NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_companies_recruiter (recruiter_profile_id),
  CONSTRAINT fk_companies_recruiter FOREIGN KEY (recruiter_profile_id) REFERENCES recruiter_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 5. skills (master list)
-- ---------------------------------------------------------------------
CREATE TABLE skills (
  id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name    VARCHAR(100) NOT NULL,
  UNIQUE KEY uq_skill_name (name)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 6. student_skills (many-to-many)
-- ---------------------------------------------------------------------
CREATE TABLE student_skills (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_profile_id  INT UNSIGNED NOT NULL,
  skill_id            INT UNSIGNED NOT NULL,
  proficiency         ENUM('beginner','intermediate','advanced','expert') NOT NULL DEFAULT 'intermediate',
  UNIQUE KEY uq_student_skill (student_profile_id, skill_id),
  CONSTRAINT fk_student_skills_student FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 7. jobs
-- ---------------------------------------------------------------------
CREATE TABLE jobs (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_id      INT UNSIGNED NOT NULL,
  posted_by       INT UNSIGNED NOT NULL, -- users.id of recruiter
  title           VARCHAR(150) NOT NULL,
  description     TEXT NOT NULL,
  responsibilities TEXT NULL,
  job_type        ENUM('full_time','part_time','internship','remote') NOT NULL,
  experience_level ENUM('fresher','0-1','1-3','3+') NOT NULL DEFAULT 'fresher',
  location        VARCHAR(150) NOT NULL,
  is_remote       TINYINT(1) NOT NULL DEFAULT 0,
  salary_min      INT UNSIGNED NULL,
  salary_max      INT UNSIGNED NULL,
  openings        INT UNSIGNED NOT NULL DEFAULT 1,
  status          ENUM('active','inactive','closed') NOT NULL DEFAULT 'active',
  application_deadline DATE NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_jobs_company (company_id),
  INDEX idx_jobs_status (status),
  INDEX idx_jobs_type (job_type),
  INDEX idx_jobs_location (location),
  INDEX idx_jobs_created (created_at),
  FULLTEXT KEY ft_jobs_title_desc (title, description),
  CONSTRAINT fk_jobs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_jobs_posted_by FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 8. job_skills (many-to-many, required skills per job)
-- ---------------------------------------------------------------------
CREATE TABLE job_skills (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id    INT UNSIGNED NOT NULL,
  skill_id  INT UNSIGNED NOT NULL,
  is_mandatory TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_job_skill (job_id, skill_id),
  CONSTRAINT fk_job_skills_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_job_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 9. resumes
-- ---------------------------------------------------------------------
CREATE TABLE resumes (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_profile_id  INT UNSIGNED NOT NULL,
  file_name           VARCHAR(255) NOT NULL,
  file_path           VARCHAR(255) NOT NULL,
  file_size           INT UNSIGNED NOT NULL,
  is_primary          TINYINT(1) NOT NULL DEFAULT 1,
  uploaded_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_resumes_student (student_profile_id),
  CONSTRAINT fk_resumes_student FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 10. education
-- ---------------------------------------------------------------------
CREATE TABLE education (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_profile_id  INT UNSIGNED NOT NULL,
  institution         VARCHAR(180) NOT NULL,
  degree              VARCHAR(120) NOT NULL,
  field_of_study      VARCHAR(120) NULL,
  start_year          YEAR NOT NULL,
  end_year            YEAR NULL,
  grade               VARCHAR(30) NULL,
  INDEX idx_education_student (student_profile_id),
  CONSTRAINT fk_education_student FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 11. experience
-- ---------------------------------------------------------------------
CREATE TABLE experience (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_profile_id  INT UNSIGNED NOT NULL,
  company_name        VARCHAR(150) NOT NULL,
  job_title            VARCHAR(150) NOT NULL,
  start_date          DATE NOT NULL,
  end_date            DATE NULL,
  is_current          TINYINT(1) NOT NULL DEFAULT 0,
  description         TEXT NULL,
  INDEX idx_experience_student (student_profile_id),
  CONSTRAINT fk_experience_student FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 12. applications
-- ---------------------------------------------------------------------
CREATE TABLE applications (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_profile_id  INT UNSIGNED NOT NULL,
  job_id              INT UNSIGNED NOT NULL,
  resume_id           INT UNSIGNED NULL,
  cover_letter        TEXT NULL,
  match_score         DECIMAL(5,2) NULL,
  status              ENUM('applied','under_review','shortlisted','interview','selected','rejected')
                       NOT NULL DEFAULT 'applied',
  applied_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_application_student_job (student_profile_id, job_id),
  INDEX idx_applications_job (job_id),
  INDEX idx_applications_status (status),
  CONSTRAINT fk_applications_student FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_resume FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 13. bookmarks
-- ---------------------------------------------------------------------
CREATE TABLE bookmarks (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_profile_id  INT UNSIGNED NOT NULL,
  job_id              INT UNSIGNED NOT NULL,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_bookmark_student_job (student_profile_id, job_id),
  CONSTRAINT fk_bookmarks_student FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookmarks_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 14. interviews
-- ---------------------------------------------------------------------
CREATE TABLE interviews (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id      INT UNSIGNED NOT NULL,
  scheduled_at        DATETIME NOT NULL,
  mode                ENUM('online','offline','phone') NOT NULL DEFAULT 'online',
  location_or_link    VARCHAR(255) NULL,
  interviewer_name    VARCHAR(150) NULL,
  notes               TEXT NULL,
  status              ENUM('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_interviews_application (application_id),
  CONSTRAINT fk_interviews_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 15. notifications
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  title       VARCHAR(150) NOT NULL,
  message     VARCHAR(500) NOT NULL,
  type        ENUM('application','job','system','interview') NOT NULL DEFAULT 'system',
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user (user_id, is_read),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- 16. admin_actions (audit log)
-- ---------------------------------------------------------------------
CREATE TABLE admin_actions (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id      INT UNSIGNED NOT NULL,
  action_type   VARCHAR(100) NOT NULL, -- e.g. 'DISABLE_USER', 'VERIFY_RECRUITER'
  target_table  VARCHAR(60) NOT NULL,
  target_id     INT UNSIGNED NOT NULL,
  details       VARCHAR(500) NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_actions_admin (admin_id),
  CONSTRAINT fk_admin_actions_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
