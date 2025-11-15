import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";

export type SemesterSeason = Enums<"semester_season">;

export type DayCode = "M" | "T" | "W" | "R" | "F";

export interface ScheduleBlock {
  id: string;
  courseId: string;
  offeringId: string;
  code: string;
  name: string;
  section: string | null;
  crn: string | null;
  instructor: string | null;
  location: string | null;
  day: DayCode;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
}

export interface ScheduleConflict {
  a: ScheduleBlock;
  b: ScheduleBlock;
  overlapMinutes: number;
}

export interface WeeklyScheduleResult {
  blocks: ScheduleBlock[];
  byDay: Record<DayCode, ScheduleBlock[]>;
  conflicts: ScheduleConflict[];
}

function toMinutes(time: string | null): number | null {
  if (!time) return null;
  const [hour, minute] = time.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
}

function sortBlocks(blocks: ScheduleBlock[]): ScheduleBlock[] {
  return [...blocks].sort((a, b) => a.startMinutes - b.startMinutes);
}

function detectConflicts(blocks: ScheduleBlock[]): ScheduleConflict[] {
  const conflicts: ScheduleConflict[] = [];

  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i];
      const b = blocks[j];

      if (a.day !== b.day) continue;

      const latestStart = Math.max(a.startMinutes, b.startMinutes);
      const earliestEnd = Math.min(a.endMinutes, b.endMinutes);
      const overlap = earliestEnd - latestStart;

      if (overlap > 0) {
        conflicts.push({
          a,
          b,
          overlapMinutes: overlap,
        });
      }
    }
  }

  return conflicts;
}

/**
 * Fetch the current user's weekly schedule for a given year and season.
 * Returns per-day blocks (with numeric times for layout) and any conflicts.
 */
export async function fetchWeeklySchedule(
  year: number,
  season: SemesterSeason
): Promise<WeeklyScheduleResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;
  if (!user) {
    return {
      blocks: [],
      byDay: {
        M: [],
        T: [],
        W: [],
        R: [],
        F: [],
      },
      conflicts: [],
    };
  }

  const { data, error } = await supabase
    .from("user_courses")
    .select(
      `
        id,
        course_id,
        offering_id,
        semester_year,
        semester_season,
        completed,
        courses (
          code,
          name
        ),
        course_offerings (
          id,
          section,
          crn,
          instructor_name,
          meeting_days,
          start_time,
          end_time,
          location
        )
      `
    )
    .eq("user_id", user.id)
    .eq("completed", false)
    .eq("semester_year", year)
    .eq("semester_season", season);

  if (error) throw error;

  const blocks: ScheduleBlock[] = [];

  for (const row of data ?? []) {
    const course = (row as any).courses;
    const offering = (row as any).course_offerings;

    if (
      !offering ||
      !offering.meeting_days ||
      !offering.start_time ||
      !offering.end_time
    ) {
      continue;
    }

    const startMinutes = toMinutes(offering.start_time);
    const endMinutes = toMinutes(offering.end_time);
    if (startMinutes == null || endMinutes == null) continue;

    const meetingDays: string[] = offering.meeting_days || [];

    for (const rawDay of meetingDays) {
      if (!["M", "T", "W", "R", "F"].includes(rawDay)) continue;

      const day = rawDay as DayCode;

      blocks.push({
        id: row.id,
        courseId: row.course_id,
        offeringId: offering.id,
        code: course?.code ?? "",
        name: course?.name ?? "",
        section: offering.section ?? null,
        crn: offering.crn ?? null,
        instructor: offering.instructor_name ?? null,
        location: offering.location ?? null,
        day,
        startTime: offering.start_time,
        endTime: offering.end_time,
        startMinutes,
        endMinutes,
      });
    }
  }

  const sortedBlocks = sortBlocks(blocks);
  const conflicts = detectConflicts(sortedBlocks);

  const byDay: WeeklyScheduleResult["byDay"] = {
    M: [],
    T: [],
    W: [],
    R: [],
    F: [],
  };

  for (const block of sortedBlocks) {
    byDay[block.day].push(block);
  }

  return {
    blocks: sortedBlocks,
    byDay,
    conflicts,
  };
}

