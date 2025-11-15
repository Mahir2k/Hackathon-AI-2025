-- Course offerings / sections with meeting times
CREATE TABLE course_offerings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  season semester_season NOT NULL,
  section VARCHAR(10),
  crn VARCHAR(20),
  instructor_name TEXT,
  -- Meeting days use single-letter codes: M, T, W, R, F
  meeting_days TEXT[] NOT NULL DEFAULT '{}',
  -- Local meeting times; stored as time without time zone
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE course_offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view course offerings"
  ON course_offerings FOR SELECT
  USING (true);

-- Link user_courses rows to specific offerings (sections)
ALTER TABLE user_courses
  ADD COLUMN offering_id UUID REFERENCES course_offerings(id);

-- Sample data: a few offerings for well-known courses, if they exist.
-- These inserts are safe no-ops when the course codes are missing.

INSERT INTO course_offerings (
  course_id,
  year,
  season,
  section,
  crn,
  instructor_name,
  meeting_days,
  start_time,
  end_time,
  location
)
SELECT
  c.id,
  2025,
  'Fall',
  '010',
  '12345',
  'Prof. Smith',
  ARRAY['M','W','F'],
  '09:10',
  '10:00',
  'Packard 101'
FROM courses c
WHERE c.code = 'CSE007';

INSERT INTO course_offerings (
  course_id,
  year,
  season,
  section,
  crn,
  instructor_name,
  meeting_days,
  start_time,
  end_time,
  location
)
SELECT
  c.id,
  2025,
  'Fall',
  '011',
  '12346',
  'Prof. Chen',
  ARRAY['T','R'],
  '13:10',
  '14:25',
  'Packard 301'
FROM courses c
WHERE c.code = 'CSE007';

INSERT INTO course_offerings (
  course_id,
  year,
  season,
  section,
  crn,
  instructor_name,
  meeting_days,
  start_time,
  end_time,
  location
)
SELECT
  c.id,
  2025,
  'Fall',
  '010',
  '22345',
  'Prof. Lee',
  ARRAY['M','W','F'],
  '10:10',
  '11:00',
  'Chandler 101'
FROM courses c
WHERE c.code = 'MATH021';

INSERT INTO course_offerings (
  course_id,
  year,
  season,
  section,
  crn,
  instructor_name,
  meeting_days,
  start_time,
  end_time,
  location
)
SELECT
  c.id,
  2025,
  'Fall',
  '010',
  '32345',
  'Prof. Rivera',
  ARRAY['T','R'],
  '09:20',
  '10:35',
  'STEPC 101'
FROM courses c
WHERE c.code = 'BUS001';

