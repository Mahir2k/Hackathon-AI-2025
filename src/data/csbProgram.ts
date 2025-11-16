export const CSB_MAJOR_NAME = "Computer Science & Business (CSB)";

export interface ProgramCourse {
  code: string;
  name: string;
  credits: number;
  department: string;
  category: string;
  description: string;
  prerequisites: string[];
}

export interface ProgramTrack {
  id: string;
  name: string;
  creditsLabel: string;
  courseCodes: string[];
}

export interface SemesterTemplate {
  year: number;
  season: "Fall" | "Spring";
  label: string;
  courseCodes: string[];
}

export const CSB_TOTAL_CREDITS = 136;

export const CSB_COURSES: ProgramCourse[] = [
  {
    code: "MATH021",
    name: "Calculus I",
    credits: 4,
    department: "Mathematics",
    category: "Mathematics",
    description: "Differential and integral calculus of one variable.",
    prerequisites: [],
  },
  {
    code: "MATH022",
    name: "Calculus II",
    credits: 4,
    department: "Mathematics",
    category: "Mathematics",
    description: "Continuation of Calculus I covering integration techniques and series.",
    prerequisites: ["MATH021"],
  },
  {
    code: "MATH205",
    name: "Linear Methods",
    credits: 3,
    department: "Mathematics",
    category: "Mathematics",
    description: "Linear algebra and differential equations for CSB majors.",
    prerequisites: ["MATH022"],
  },
  {
    code: "CSE007",
    name: "Introduction to Programming",
    credits: 3,
    department: "Computer Science",
    category: "CS Foundations",
    description: "Structured programming foundations using Python/C++.",
    prerequisites: [],
  },
  {
    code: "CSE017",
    name: "Programming and Data Structures",
    credits: 3,
    department: "Computer Science",
    category: "CS Foundations",
    description: "Object-oriented design and classic data structures.",
    prerequisites: ["CSE007"],
  },
  {
    code: "CSE109",
    name: "Systems Software",
    credits: 4,
    department: "Computer Science",
    category: "CS Foundations",
    description: "Low-level programming, memory management, and build systems.",
    prerequisites: ["CSE017"],
  },
  {
    code: "CSE202",
    name: "Computer Organization and Architecture",
    credits: 3,
    department: "Computer Science",
    category: "CS Foundations",
    description: "Machine-level architecture and organization concepts.",
    prerequisites: ["CSE109"],
  },
  {
    code: "CSE303",
    name: "Operating System Design",
    credits: 3,
    department: "Computer Science",
    category: "CS Foundations",
    description: "Concurrency, scheduling, and OS-level abstractions.",
    prerequisites: ["CSE202"],
  },
  {
    code: "CSE140",
    name: "Discrete Structures and Algorithms",
    credits: 3,
    department: "Computer Science",
    category: "CS Supporting",
    description: "Proof techniques, combinatorics, and discrete math for CSB majors.",
    prerequisites: ["MATH021"],
  },
  {
    code: "CSE241",
    name: "Database Systems and Applications",
    credits: 3,
    department: "Computer Science",
    category: "CS Supporting",
    description: "Relational design, SQL, and transaction management.",
    prerequisites: ["CSE017"],
  },
  {
    code: "CSE216",
    name: "Software Engineering",
    credits: 3,
    department: "Computer Science",
    category: "CS Supporting",
    description: "Software lifecycle, testing, and agile practices.",
    prerequisites: ["CSE017"],
  },
  {
    code: "CSE262",
    name: "Programming Languages",
    credits: 3,
    department: "Computer Science",
    category: "CS Supporting",
    description: "Programming language paradigms and interpreters.",
    prerequisites: ["CSE017"],
  },
  {
    code: "CSE340",
    name: "Design and Analysis of Algorithms",
    credits: 3,
    department: "Computer Science",
    category: "CS Supporting",
    description: "Algorithm design strategies and complexity analysis.",
    prerequisites: ["CSE140", "CSE216"],
  },
  {
    code: "CSE252",
    name: "Ethical Issues in Computing",
    credits: 3,
    department: "Computer Science",
    category: "CS Supporting",
    description: "Ethics, privacy, and policy concerns in technology.",
    prerequisites: [],
  },
  {
    code: "BUS001",
    name: "Foundations of Business",
    credits: 1,
    department: "Business",
    category: "Business Core",
    description: "Orientation to functional areas of business.",
    prerequisites: [],
  },
  {
    code: "BUS002",
    name: "Business Analytics",
    credits: 3,
    department: "Business",
    category: "Business Core",
    description: "Data-driven decision making for managers.",
    prerequisites: ["BUS001"],
  },
  {
    code: "BUS003",
    name: "Business Communication I",
    credits: 1.5,
    department: "Business",
    category: "Business Core",
    description: "Professional communication fundamentals.",
    prerequisites: ["BUS001"],
  },
  {
    code: "BUS203",
    name: "Business Communication II",
    credits: 1.5,
    department: "Business",
    category: "Business Core",
    description: "Advanced professional communication.",
    prerequisites: ["BUS003"],
  },
  {
    code: "ECO001",
    name: "Principles of Economics",
    credits: 4,
    department: "Economics",
    category: "Business Core",
    description: "Introduction to micro and macroeconomic principles.",
    prerequisites: [],
  },
  {
    code: "ECO029",
    name: "Microeconomic Analysis",
    credits: 3,
    department: "Economics",
    category: "Business Core",
    description: "Intermediate microeconomics with business applications.",
    prerequisites: ["ECO001"],
  },
  {
    code: "ECO045",
    name: "Business Statistics",
    credits: 3,
    department: "Economics",
    category: "Business Core",
    description: "Probability and statistics for business decisions.",
    prerequisites: ["ECO029"],
  },
  {
    code: "MKT111",
    name: "Principles of Marketing",
    credits: 3,
    department: "Marketing",
    category: "Business Core",
    description: "Marketing strategy, consumer behavior, and analytics.",
    prerequisites: ["ECO001"],
  },
  {
    code: "LAW201",
    name: "Legal Environment of Business",
    credits: 3,
    department: "Business",
    category: "Business Core",
    description: "Contracts, regulation, and policy issues.",
    prerequisites: ["ECO001"],
  },
  {
    code: "FIN125",
    name: "Introduction to Finance",
    credits: 3,
    department: "Finance",
    category: "Business Core",
    description: "Time value of money, risk, and valuation.",
    prerequisites: ["ECO001"],
  },
  {
    code: "ACCT151",
    name: "Financial Accounting",
    credits: 3,
    department: "Accounting",
    category: "Business Core",
    description: "Financial accounting concepts and statements.",
    prerequisites: [],
  },
  {
    code: "ACCT152",
    name: "Managerial Accounting",
    credits: 3,
    department: "Accounting",
    category: "Business Core",
    description: "Cost analysis and budgeting for decision support.",
    prerequisites: ["ACCT151"],
  },
  {
    code: "SCM186",
    name: "Supply Chain Operations",
    credits: 3,
    department: "Supply Chain",
    category: "Business Core",
    description: "Supply chain fundamentals and process optimization.",
    prerequisites: ["ECO045"],
  },
  {
    code: "CSB311",
    name: "Info Systems Analysis",
    credits: 3,
    department: "CSB",
    category: "CSB Bridge",
    description: "Bridging CS and business requirements gathering.",
    prerequisites: ["BUS002", "CSE216", "ACCT152"],
  },
  {
    code: "CSB312",
    name: "Design of Integrated Business Applications I",
    credits: 3,
    department: "CSB",
    category: "CSB Bridge",
    description: "Cross-functional system prototyping.",
    prerequisites: ["CSB311"],
  },
  {
    code: "CSB313",
    name: "Design of Integrated Business Applications II",
    credits: 3,
    department: "CSB",
    category: "CSB Bridge",
    description: "Capstone build of enterprise applications.",
    prerequisites: ["CSB312"],
  },
  {
    code: "MGT043",
    name: "Organizational Behavior",
    credits: 3,
    department: "Management",
    category: "Business Core",
    description: "Individual and team dynamics in organizations.",
    prerequisites: [],
  },
  {
    code: "ECO146",
    name: "Intermediate Microeconomics",
    credits: 3,
    department: "Economics",
    category: "Business Core",
    description: "Advanced microeconomic analysis.",
    prerequisites: ["ECO029"],
  },
  {
    code: "ECO119",
    name: "Intermediate Macroeconomics",
    credits: 3,
    department: "Economics",
    category: "Business Core",
    description: "Advanced macroeconomic analysis.",
    prerequisites: ["ECO029"],
  },
  {
    code: "MGT301",
    name: "Strategic Management in a Global Environment",
    credits: 3,
    department: "Management",
    category: "Capstone",
    description: "CSB capstone integrating the entire curriculum.",
    prerequisites: [
      "BUS001",
      "BUS003",
      "BUS203",
      "MGT043",
      "ACCT152",
      "MKT111",
      "LAW201",
      "FIN125",
      "SCM186",
      "ECO146",
      "CSB311",
      "CSB312",
    ],
  },
];

const courseMap: Record<string, ProgramCourse> = CSB_COURSES.reduce((acc, course) => {
  acc[course.code] = course;
  return acc;
}, {} as Record<string, ProgramCourse>);

const trackDefinitions: ProgramTrack[] = [
  {
    id: "math",
    name: "Mathematics",
    creditsLabel: "11 credits",
    courseCodes: ["MATH021", "MATH022", "MATH205"],
  },
  {
    id: "cs-foundations",
    name: "CS Foundations",
    creditsLabel: "16 credits",
    courseCodes: ["CSE007", "CSE017", "CSE109", "CSE202", "CSE303"],
  },
  {
    id: "cs-support",
    name: "Supporting CS Courses",
    creditsLabel: "18 credits",
    courseCodes: ["CSE140", "CSE216", "CSE241", "CSE262", "CSE340", "CSE252"],
  },
  {
    id: "business-core",
    name: "Business Core",
    creditsLabel: "23 credits",
    courseCodes: [
      "BUS001",
      "BUS002",
      "BUS003",
      "BUS203",
      "ECO001",
      "ECO029",
      "ECO045",
      "MKT111",
      "LAW201",
      "FIN125",
      "MGT043",
    ],
  },
  {
    id: "accounting",
    name: "Accounting & Supply Chain",
    creditsLabel: "12 credits",
    courseCodes: ["ACCT151", "ACCT152", "SCM186"],
  },
  {
    id: "csb-bridge",
    name: "CSB Integrative Sequence",
    creditsLabel: "9 credits",
    courseCodes: ["CSB311", "CSB312", "CSB313"],
  },
  {
    id: "economics-depth",
    name: "Economics Depth",
    creditsLabel: "6 credits",
    courseCodes: ["ECO146", "ECO119"],
  },
  {
    id: "capstone",
    name: "Business Capstone",
    creditsLabel: "3 credits",
    courseCodes: ["MGT301"],
  },
];

export const CSB_TRACKS = trackDefinitions.map((track) => ({
  ...track,
  courses: track.courseCodes
    .map((code) => courseMap[code])
    .filter((course): course is ProgramCourse => Boolean(course)),
}));

export const CSB_CATALOG_COURSES = CSB_COURSES.map((course) => ({
  id: course.code,
  code: course.code,
  name: course.name,
  description: course.description,
  credits: course.credits,
  category: "Major",
  department: course.department,
  prerequisites: course.prerequisites,
  difficulty: 0,
  workload_hours: Math.round(course.credits * 3),
}));

export const CSB_PLAN_TEMPLATE: SemesterTemplate[] = [
  {
    year: 1,
    season: "Fall",
    label: "Year 1 - Fall",
    courseCodes: ["MATH021", "CSE007", "BUS001", "BUS003", "ECO001", "MGT043"],
  },
  {
    year: 1,
    season: "Spring",
    label: "Year 1 - Spring",
    courseCodes: ["MATH022", "CSE017", "ACCT151", "BUS002", "ECO029", "LAW201"],
  },
  {
    year: 2,
    season: "Fall",
    label: "Year 2 - Fall",
    courseCodes: ["MATH205", "CSE109", "ACCT152", "ECO045", "CSE140", "BUS203"],
  },
  {
    year: 2,
    season: "Spring",
    label: "Year 2 - Spring",
    courseCodes: ["CSE202", "CSE216", "CSE241", "MKT111", "FIN125"],
  },
  {
    year: 3,
    season: "Fall",
    label: "Year 3 - Fall",
    courseCodes: ["CSE303", "CSE262", "SCM186", "ECO146"],
  },
  {
    year: 3,
    season: "Spring",
    label: "Year 3 - Spring",
    courseCodes: ["CSE252", "CSE340", "CSB311", "FIN125"],
  },
  {
    year: 4,
    season: "Fall",
    label: "Year 4 - Fall",
    courseCodes: ["CSB312", "ECO119"],
  },
  {
    year: 4,
    season: "Spring",
    label: "Year 4 - Spring",
    courseCodes: ["CSB313", "MGT301"],
  },
];

export const CSB_REQUIRED_COURSE_CODES = new Set(CSB_COURSES.map((course) => course.code));
