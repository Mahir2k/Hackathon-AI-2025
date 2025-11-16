export interface MinorCourseRequirement {
  code: string;
  name: string;
  credits: number;
  preferredSemester?: number;
  category?: string;
}

export interface MinorOption {
  id: string;
  label: string;
  requirements: MinorCourseRequirement[];
}

export const MINOR_OPTIONS: MinorOption[] = [
  {
    id: "data-science",
    label: "Data Science",
    requirements: [
      {
        code: "CSE160",
        name: "Introduction to Data Science",
        credits: 3,
        preferredSemester: 0,
      },
      {
        code: "MATH312",
        name: "Statistical Computing and Applications",
        credits: 4,
        preferredSemester: 3,
      },
      {
        code: "CSE347",
        name: "Data Mining",
        credits: 3,
        preferredSemester: 5,
      },
      {
        code: "CSE241",
        name: "Database Systems and Applications",
        credits: 3,
        preferredSemester: 4,
      },
    ],
  },
];

export const getMinorOption = (id: string | null | undefined) =>
  MINOR_OPTIONS.find((option) => option.id === id);
