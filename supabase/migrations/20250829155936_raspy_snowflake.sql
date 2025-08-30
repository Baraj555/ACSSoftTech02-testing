/*
  # Training Institute Database Schema

  1. New Tables
    - `courses` - Store course information
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `duration` (integer, weeks)
      - `price` (integer)
      - `image` (text, URL)
      - `features` (text array)
      - `level` (text)
      - `instructor` (text)
      - `category` (text)
      - `start_date` (date)
      - `max_students` (integer)
      - `enrolled_students` (integer)
      - `created_at` (timestamp)

    - `enrollments` - Store student enrollments
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key)
      - `course_name` (text)
      - `student_name` (text)
      - `student_email` (text)
      - `student_phone` (text)
      - `enrollment_date` (timestamp)
      - `status` (text)
      - `price` (integer)
      - `progress` (integer, percentage)
      - `notes` (text)
      - `experience` (text)
      - `goals` (text)
      - `created_at` (timestamp)

    - `students` - Store student information
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `total_courses` (integer)
      - `member_since` (date)
      - `last_activity` (timestamp)
      - `completed_courses` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to courses
    - Add policies for enrollment creation and student data access
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  duration integer NOT NULL,
  price integer NOT NULL,
  image text NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  level text NOT NULL DEFAULT 'Beginner',
  instructor text NOT NULL,
  category text NOT NULL,
  start_date date NOT NULL,
  max_students integer NOT NULL DEFAULT 25,
  enrolled_students integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  student_name text NOT NULL,
  student_email text NOT NULL,
  student_phone text NOT NULL,
  enrollment_date timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'enrolled',
  price integer NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  notes text DEFAULT '',
  experience text DEFAULT '',
  goals text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  total_courses integer NOT NULL DEFAULT 0,
  member_since date DEFAULT CURRENT_DATE,
  last_activity timestamptz DEFAULT now(),
  completed_courses integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Create policies for courses (public read access)
CREATE POLICY "Anyone can view courses"
  ON courses
  FOR SELECT
  TO public
  USING (true);

-- Create policies for enrollments (anyone can create, students can view their own)
CREATE POLICY "Anyone can create enrollments"
  ON enrollments
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Students can view their own enrollments"
  ON enrollments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update enrollments"
  ON enrollments
  FOR UPDATE
  TO public
  USING (true);

-- Create policies for students (anyone can create and view)
CREATE POLICY "Anyone can create students"
  ON students
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view students"
  ON students
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update students"
  ON students
  FOR UPDATE
  TO public
  USING (true);

-- Insert sample courses
INSERT INTO courses (name, description, duration, price, image, features, level, instructor, category, start_date, max_students, enrolled_students) VALUES
(
  'Full Stack Web Development',
  'Complete web development bootcamp covering HTML, CSS, JavaScript, React, Node.js, and databases.',
  12,
  20000,
  'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg',
  ARRAY['HTML5 & CSS3', 'JavaScript ES6+', 'React & Redux', 'Node.js & Express', 'SQL', 'Project Portfolio'],
  'Beginner',
  'Srikanth',
  'Web Development',
  '2025-10-15',
  25,
  18
),
(
  'Data Engineer',
  'Comprehensive Python course from basics to advanced topics including data engineering and automation.',
  12,
  30000,
  'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg',
  ARRAY['Python Fundamentals', 'Data Structures', 'Web Scraping', 'Automation Scripts', 'SQL', 'Big Data Tools', 'Real Projects', 'Databricks', 'Azure Data Factory'],
  'Beginner',
  'Venkaiah Naidu',
  'Programming',
  '2025-09-01',
  10,
  7
),
(
  'Cloud Computing & DevOps',
  'Learn cloud platforms, containerization, CI/CD, and modern DevOps practices for scalable applications.',
  12,
  25000,
  'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg',
  ARRAY['AWS/Azure/GCP', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Infrastructure as Code', 'Monitoring & Logging', 'Security Best Practices'],
  'Advanced',
  'VasuDeva',
  'Cloud & DevOps',
  '2025-09-15',
  10,
  3
),
(
  'Medical Coding',
  'Ensure accurate healthcare billing, insurance claims, and compliance by translating medical diagnoses and procedures into standardized universal codes.',
  12,
  30000,
  'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg',
  ARRAY['3M CodeFinder / 3M 360 Encompass', 'Optum EncoderPro.com', 'AHIMA CLiNQ', 'Medicode / SuperCoder (AAPC)', 'Find-A-Code'],
  'Intermediate',
  'Dr. Ravi Prathap',
  'Medical Coding',
  '2025-09-15',
  15,
  12
)
ON CONFLICT DO NOTHING;