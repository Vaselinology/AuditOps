-- TUNISAIR AUDIT MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ==========================================================================

CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  abbreviation VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles: admin | audit_manager | quality_safety_manager | auditee
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE CHECK (email LIKE '%@tunisair.com.tn'),
  password_hash VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  activity VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'auditee' CHECK (role IN ('admin','audit_manager','quality_safety_manager','auditee')),
  department_id INTEGER REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referentials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  department_id INTEGER REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_referentials (
  activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
  referential_id INTEGER REFERENCES referentials(id) ON DELETE CASCADE,
  PRIMARY KEY (activity_id, referential_id)
);

CREATE TABLE IF NOT EXISTS audits (
  id SERIAL PRIMARY KEY,
  audit_number VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('planned','unplanned','external')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','notified','in_progress','completed','closed')),
  auditor_id INTEGER REFERENCES users(id),
  department VARCHAR(255),
  planned_date DATE,
  start_date DATE,
  end_date DATE,
  adresse TEXT,
  audit_subject TEXT,
  audit_duration VARCHAR(100),
  audit_place VARCHAR(255),
  referentials TEXT,
  audit_plan JSONB,
  auditees JSONB,
  notification_sent_at TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_notifications (
  id SERIAL PRIMARY KEY,
  audit_id INTEGER REFERENCES audits(id) ON DELETE CASCADE,
  notification_number VARCHAR(50),
  version VARCHAR(10) NOT NULL CHECK (version IN ('DGAC','PART')),
  html_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_reports (
  id SERIAL PRIMARY KEY,
  audit_id INTEGER REFERENCES audits(id) ON DELETE CASCADE,
  report_number VARCHAR(50) NOT NULL UNIQUE,
  version VARCHAR(10) NOT NULL DEFAULT 'DGAC' CHECK (version IN ('DGAC','PART')),
  content JSONB,
  html_content TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  generated_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS finding_sheets (
  id SERIAL PRIMARY KEY,
  audit_id INTEGER REFERENCES audits(id) ON DELETE CASCADE,
  sheet_number VARCHAR(50) NOT NULL UNIQUE,
  version VARCHAR(10) NOT NULL DEFAULT 'DGAC' CHECK (version IN ('DGAC','PART')),
  referenced_documents JSONB,
  subject TEXT,
  address TEXT,
  defects JSONB,
  addressee_response JSONB,
  action_plan_data JSONB,
  filled_by INTEGER REFERENCES users(id),
  filled_by_date DATE,
  html_content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS findings (
  id SERIAL PRIMARY KEY,
  audit_id INTEGER REFERENCES audits(id) ON DELETE CASCADE,
  finding_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('critical','major','minor')),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS yearly_planning (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  department VARCHAR(255),
  planned_audit_title VARCHAR(255) NOT NULL,
  planned_quarter VARCHAR(10),
  planned_month INTEGER,
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned','scheduled','completed')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS programme_rows (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER DEFAULT 1 NOT NULL,
  year INTEGER NOT NULL,
  domain VARCHAR(255) NOT NULL,
  referentiel VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS programme_slots (
  id SERIAL PRIMARY KEY,
  row_id INTEGER REFERENCES programme_rows(id) ON DELETE CASCADE,
  original_month INTEGER NOT NULL,
  original_week INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'planned',
  postponed_month INTEGER,
  postponed_week INTEGER,
  audit_day INTEGER,
  title VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issue_reports (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(50),
  event_type VARCHAR(100),
  event_date DATE,
  event_references TEXT,
  ac_mat VARCHAR(255),
  event_name VARCHAR(255),
  location VARCHAR(255),
  source VARCHAR(255),
  description TEXT NOT NULL,
  urgency VARCHAR(50) DEFAULT 'normal',
  initial_probability INTEGER,
  initial_severity INTEGER,
  potential_hazard TEXT,
  hazard_list JSONB,
  existing_measures TEXT,
  proposed_actions TEXT,
  investigation TEXT,
  investigation_report_url TEXT,
  action_recommendation TEXT,
  reass_probability INTEGER,
  reass_severity INTEGER,
  effectiveness_suitability VARCHAR(255),
  effectiveness_date DATE,
  risk_analysis_p BOOLEAN DEFAULT FALSE,
  risk_analysis_s BOOLEAN DEFAULT FALSE,
  risk_analysis_r BOOLEAN DEFAULT FALSE,
  responsible_id INTEGER REFERENCES users(id),
  review_date DATE,
  corrective_action TEXT,
  deadline DATE,
  status VARCHAR(50) DEFAULT 'submitted',
  reported_by INTEGER REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id),
  report_html TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS action_plans (
  id SERIAL PRIMARY KEY,
  issue_id INTEGER REFERENCES issue_reports(id) ON DELETE SET NULL,
  audit_id INTEGER REFERENCES audits(id) ON DELETE SET NULL,
  finding_id INTEGER REFERENCES findings(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  responsible_id INTEGER REFERENCES users(id),
  due_date DATE,
  completion_date DATE,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reminders (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  related_id INTEGER NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  remind_at TIMESTAMP NOT NULL,
  offset_label VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  message TEXT,
  sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(50) DEFAULT 'normal',
  published_by INTEGER REFERENCES users(id),
  published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  related_id INTEGER,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  related_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audits_status ON audits (status);
CREATE INDEX IF NOT EXISTS idx_audits_created ON audits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issue_reports (status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind ON reminders (remind_at, sent);
CREATE INDEX IF NOT EXISTS idx_calendar_date ON calendar_events (event_date);

-- ==========================================================================
-- SEED DATA
-- ==========================================================================

INSERT INTO departments (name, abbreviation) VALUES
  ('Administration', 'ADM'),
  ('Direction Générale Technique et de la Transformation', 'DGTT'),
  ('Direction Assurance Qualité et Sécurité', 'DAQSE'),
  ('Direction de la Maintenance', 'DM'),
  ('Direction des Ressources et Equipes', 'DRE'),
  ('Direction Commerciale', 'DC'),
  ('Direction Financière et Trésorerie', 'DFT'),
  ('Direction des Affaires Aéronautiques', 'DAA'),
  ('Direction des Lignes et Aéroports', 'DLA'),
  ('Direction du Cargo', 'DCP'),
  ('Direction Informatique et Télécom', 'DIT'),
  ('Direction de la Logistique Technique', 'DLT'),
  ('Direction Vente et Service Client', 'DVSC')
ON CONFLICT DO NOTHING;

INSERT INTO referentials (name, code, description) VALUES
  ('ISO 9001:2015', 'ISO9001', 'Systèmes de management de la qualité'),
  ('EN 9100:2018', 'EN9100', 'Aviation, espace et défense'),
  ('IOSA', 'IOSA', 'IATA Operational Safety Audit'),
  ('SMS', 'SMS', 'Safety Management System'),
  ('PART-145', 'P145', 'Maintenance organizations'),
  ('PART-M', 'PM', 'Continuing airworthiness'),
  ('PART-66', 'P66', 'Aircraft maintenance licensing'),
  ('PART-147', 'P147', 'Maintenance training organisations')
ON CONFLICT DO NOTHING;

INSERT INTO users (first_name, last_name, email, password_hash, title, activity, role, department_id)
VALUES ('Haifa', 'Sdiri', 'Haifa.SDIRI@tunisair.com.tn', 'REPLACE_WITH_ARGON2_HASH', 'Administrator', 'Administration: TUNIS-CARTHAGE', 'admin', 1)
ON CONFLICT (email) DO NOTHING;