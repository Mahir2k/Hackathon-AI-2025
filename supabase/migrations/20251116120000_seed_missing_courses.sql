-- Seed essential core courses if they are missing.
INSERT INTO courses (code, name, description, credits, category, department, prerequisites, difficulty, workload_hours)
SELECT
  'BUS001',
  'Business Principles',
  'Foundational overview of business disciplines and concepts.',
  3,
  'Major',
  'BUS',
  ARRAY[]::text[],
  3,
  9
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'BUS001');

INSERT INTO courses (code, name, description, credits, category, department, prerequisites, difficulty, workload_hours)
SELECT
  'BUS002',
  'Business Analytics',
  'Analytical methods and tools used in modern business environments.',
  3,
  'Major',
  'BUS',
  ARRAY['BUS001'],
  4,
  9
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'BUS002');

INSERT INTO courses (code, name, description, credits, category, department, prerequisites, difficulty, workload_hours)
SELECT
  'ECO029',
  'Microeconomics',
  'Microeconomic theory with business applications.',
  3,
  'Major',
  'ECO',
  ARRAY['BUS001'],
  4,
  9
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'ECO029');

INSERT INTO courses (code, name, description, credits, category, department, prerequisites, difficulty, workload_hours)
SELECT
  'ENGR001',
  'Engineering Design',
  'Introductory engineering design process and teamwork.',
  3,
  'Major',
  'ENGR',
  ARRAY[]::text[],
  4,
  9
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'ENGR001');

INSERT INTO courses (code, name, description, credits, category, department, prerequisites, difficulty, workload_hours)
SELECT
  'ENGR002',
  'Engineering Analysis',
  'Engineering analysis techniques building on design foundations.',
  3,
  'Major',
  'ENGR',
  ARRAY['ENGR001','MATH021'],
  5,
  9
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'ENGR002');

INSERT INTO courses (code, name, description, credits, category, department, prerequisites, difficulty, workload_hours)
SELECT
  'ECO045',
  'Engineering Economics',
  'Economic decision making for engineers.',
  3,
  'Major',
  'ECO',
  ARRAY['ECO029'],
  4,
  9
WHERE NOT EXISTS (SELECT 1 FROM courses WHERE code = 'ECO045');
