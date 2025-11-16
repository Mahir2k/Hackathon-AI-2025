-- Store external professor reviews (e.g., from RateMyProfessors)
CREATE TABLE professor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_name TEXT NOT NULL,
  course_code VARCHAR(20),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'ratemyprofessors',
  rating NUMERIC(3,2),
  helpful_count INTEGER,
  comment TEXT NOT NULL,
  rmp_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE professor_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view professor reviews"
  ON professor_reviews FOR SELECT
  USING (true);

-- Optional sample rows for local/testing use only (run only if matching course codes exist)
INSERT INTO professor_reviews (professor_name, course_code, course_id, rating, helpful_count, comment)
SELECT
  'Prof. Smith',
  'CSE007',
  c.id,
  4.8,
  25,
  'Explains concepts clearly and cares about students'' success.'
FROM courses c
WHERE c.code = 'CSE007';

INSERT INTO professor_reviews (professor_name, course_code, course_id, rating, helpful_count, comment)
SELECT
  'Prof. Smith',
  'CSE007',
  c.id,
  4.6,
  18,
  'Challenging but fair. Homework closely matches exams.'
FROM courses c
WHERE c.code = 'CSE007';

INSERT INTO professor_reviews (professor_name, course_code, course_id, rating, helpful_count, comment)
SELECT
  'Prof. Lee',
  'MATH021',
  c.id,
  4.9,
  30,
  'Best math professor I''ve had—lots of examples and practice problems.'
FROM courses c
WHERE c.code = 'MATH021';

