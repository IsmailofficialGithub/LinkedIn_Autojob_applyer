create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  full_name text,
  phone text,
  location text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists linkedin_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  linkedin_sub text not null,
  name text,
  email text,
  picture text,
  li_at_cookie text,
  connected boolean default true,
  connected_at timestamptz,
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  bucket text not null,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  size integer not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists email_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  encrypted_app_password text not null,
  enabled boolean default true,
  smtp_status text default 'untested',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists email_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subject text not null,
  body text not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists keyword_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  keywords jsonb not null default '[]',
  filters jsonb not null default '{}',
  enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists automation_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  auto_send_enabled boolean default false,
  scan_enabled boolean default true,
  max_emails_per_day integer default 100,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists job_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source_type text not null check (source_type in ('linkedin_job', 'linkedin_post')),
  url text not null,
  canonical_url text not null,
  content text not null,
  content_hash text not null,
  status text default 'submitted',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists recruiter_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  job_submission_id uuid,
  email text not null,
  source text default 'extracted',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists email_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  job_submission_id uuid,
  recruiter_email_id uuid,
  recipient text not null,
  subject text not null,
  body text not null,
  resume_id uuid,
  status text default 'pending',
  attempts integer default 0,
  max_attempts integer default 3,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists email_send_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email_queue_id uuid not null,
  recipient text not null,
  status text not null,
  message text,
  created_at timestamptz default now()
);

create table if not exists automation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  status text not null,
  message text,
  created_at timestamptz default now()
);
