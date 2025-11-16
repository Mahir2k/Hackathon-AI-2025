import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle, Lock, Star, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import ChatBot from "@/components/ChatBot";
import { CSB_COURSES, CSB_MAJOR_NAME, CSB_TOTAL_CREDITS, CSB_TRACKS } from "@/data/csbProgram";

const DEFAULT_TRACKS = [
  {
    id: "math",
    name: "Mathematics",
    color: "bg-blue-500",
    creditsLabel: "",
    courses: [
      { code: "MATH021", name: "Calculus I", prereqs: [] },
      { code: "MATH022", name: "Calculus II", prereqs: ["MATH021"] },
      { code: "MATH205", name: "Linear Algebra", prereqs: ["MATH022"] },
    ],
  },
  {
    id: "cs",
    name: "CS Foundations",
    color: "bg-purple-500",
    creditsLabel: "",
    courses: [
      { code: "CSE007", name: "Intro Programming", prereqs: [] },
      { code: "CSE017", name: "Data Structures", prereqs: ["CSE007"] },
      { code: "CSE109", name: "Systems Software", prereqs: ["CSE017"] },
    ],
  },
  {
    id: "business",
    name: "Business Core",
    color: "bg-green-500",
    creditsLabel: "",
    courses: [
      { code: "BUS001", name: "Business Principles", prereqs: [] },
      { code: "BUS002", name: "Business Analytics", prereqs: ["BUS001"] },
      { code: "ECO029", name: "Microeconomics", prereqs: ["BUS001"] },
    ],
  },
  {
    id: "engineering",
    name: "Engineering Core",
    color: "bg-orange-500",
    creditsLabel: "",
    courses: [
      { code: "ENGR001", name: "Engineering Design", prereqs: [] },
      { code: "ENGR002", name: "Engineering Analysis", prereqs: ["ENGR001", "MATH021"] },
      { code: "ECO045", name: "Engineering Economics", prereqs: ["ECO029"] },
    ],
  },
];

const CSB_TRACK_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-cyan-500",
  "bg-rose-500",
];

const CSB_FLOWCHART_TRACKS = CSB_TRACKS.map((track, index) => ({
  id: track.id,
  name: track.name,
  creditsLabel: track.creditsLabel,
  color: CSB_TRACK_COLORS[index % CSB_TRACK_COLORS.length],
  courses: track.courses.map((course) => ({
    code: course.code,
    name: course.name,
    prereqs: course.prerequisites,
    credits: course.credits,
  })),
}));

const Progression = () => {
  const { toast } = useToast();
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [userMajor, setUserMajor] = useState<string | null>(null);
  const [mockCompleted, setMockCompleted] = useState<Set<string>>(new Set());
  const [mockKey, setMockKey] = useState<string | null>(null);

  useEffect(() => {
    fetchCompleted();
    fetchProfile();
  }, []);

  const fetchCompleted = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("user_courses")
      .select("courses(code)")
      .eq("user_id", user.id)
      .eq("completed", true);

    const supSet = new Set(data?.map((c: any) => c.courses.code) || []);

    if (mockKey) {
      const stored = localStorage.getItem(mockKey);
      if (stored) {
        const mockArray = JSON.parse(stored) as string[];
        const union = new Set([...supSet, ...mockArray]);
        setMockCompleted(new Set(mockArray));
        setCompleted(union);
        return;
      }
    }

    setCompleted(supSet);
  };

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("major")
      .eq("id", user.id)
      .single();
    setUserMajor(profile?.major ?? null);
    const key = `progression-mock-${user.id}`;
    setMockKey(key);
    const stored = localStorage.getItem(key);
    if (stored) {
      const mockArray = JSON.parse(stored) as string[];
      setMockCompleted(new Set(mockArray));
      setCompleted((prev) => new Set([...prev, ...mockArray]));
    }
  };

  const persistMock = (next: Set<string>, key: string) => {
    localStorage.setItem(key, JSON.stringify(Array.from(next)));
  };

  const toggleMockCourse = (code: string) => {
    if (!mockKey) return;
    setMockCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      persistMock(next, mockKey);
      setCompleted((current) => {
        const merged = new Set(current);
        if (merged.has(code)) {
          if (!next.has(code)) merged.delete(code);
        } else {
          merged.add(code);
        }
        return merged;
      });
      return next;
    });
  };

  const toggleCourse = async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const isCompleted = completed.has(code);
    let { data: course } = await supabase
      .from("courses")
      .select("id")
      .eq("code", code)
      .single();
    if (!course) {
      toggleMockCourse(code);
      return;
    }

    if (isCompleted) {
      await supabase
        .from("user_courses")
        .delete()
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .then(({ error }) => {
          if (error) {
            toggleMockCourse(code);
            return;
          }
          setCompleted((prev) => {
            const next = new Set(prev);
            next.delete(code);
            return next;
          });
        });
    } else {
      const { error } = await supabase
        .from("user_courses")
        .insert({ user_id: user.id, course_id: course.id, completed: true });

      if (error) {
        toggleMockCourse(code);
      } else {
        setCompleted((prev) => new Set(prev).add(code));
        toast({
          title: "Course unlocked",
          description: `${code} marked complete. New courses may now be available.`,
        });
      }
    }
  };

  const isAvailable = (course: any) => course.prereqs.every((p: string) => completed.has(p));

  const isCsb = userMajor === CSB_MAJOR_NAME;
  const activeTracks = isCsb ? CSB_FLOWCHART_TRACKS : DEFAULT_TRACKS;
  const activeCourses = activeTracks.flatMap((track) => track.courses);
  const completedInActive = activeCourses.filter((course) => completed.has(course.code)).length;
  const totalActiveCourses = activeCourses.length;
  const overallPercent = totalActiveCourses === 0 ? 0 : (completedInActive / totalActiveCourses) * 100;
  const csbCreditsEarned = CSB_COURSES.reduce((sum, course) => {
    return completed.has(course.code) ? sum + course.credits : sum;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ChatBot context="User is viewing course progression flowchart with prerequisite chains" />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Star className="h-8 w-8 text-yellow-500" />
            {isCsb ? "⭐ CSB Course Progression Flowchart" : "Course Progression Flowchart"}
          </h1>
          <p className="text-muted-foreground">
            Complete courses to unlock new ones in your path
          </p>
        </div>

        <Card className="p-6 mb-8">
          {isCsb ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-widest">
                    Credits earned
                  </p>
                  <div className="text-2xl font-bold">
                    {csbCreditsEarned} / {CSB_TOTAL_CREDITS}
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground tracking-widest">
                    Overall progress
                  </p>
                  <div className="text-2xl font-bold">
                    {completedInActive} / {totalActiveCourses} courses
                  </div>
                </div>
              </div>
              <Progress value={overallPercent} className="h-3" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Overall Progress</h2>
                <Badge variant="secondary" className="text-lg px-4 py-1">
                  {completedInActive} / {activeCourses.length} courses
                </Badge>
              </div>
              <Progress value={overallPercent} className="h-3" />
            </>
          )}
        </Card>

        <div className="space-y-8">
          {activeTracks.map(track => {
            const trackCompleted = track.courses.filter(c => completed.has(c.code)).length;
            const trackTotal = track.courses.length;
            const trackProgress = (trackCompleted / trackTotal) * 100;
            
            return (
              <Card key={track.id} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-4 h-4 rounded ${track.color}`} />
                  <div>
                    <h3 className="text-xl font-semibold">{track.name}</h3>
                    {track.creditsLabel && (
                      <p className="text-xs text-muted-foreground">{track.creditsLabel}</p>
                    )}
                  </div>
                  <Badge variant="outline">{trackCompleted} / {trackTotal}</Badge>
                </div>
                <Progress value={trackProgress} className="h-2 mb-6" />
                
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {track.courses.map((course, i) => {
                    const isCompleted = completed.has(course.code);
                    const canTake = isAvailable(course);
                    return (
                      <div key={course.code} className="flex items-center gap-4 flex-shrink-0">
                        <button
                          onClick={() => canTake || isCompleted ? toggleCourse(course.code) : null}
                          disabled={!canTake && !isCompleted}
                          className={`min-w-[200px] p-4 rounded-lg border-2 transition-all duration-300 ${
                            isCompleted ? "bg-green-500/10 border-green-500 hover:bg-green-500/20" :
                            canTake ? "bg-primary/10 border-primary hover:bg-primary/20" :
                            "bg-muted border-border opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-semibold">
                              {course.code}
                              {course.credits ? ` — ${course.credits} cr` : ""}
                            </div>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : canTake ? (
                              <Sparkles className="w-5 h-5 text-primary" />
                            ) : (
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="text-sm text-left">{course.name}</div>
                          {course.prereqs.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-2">
                              Requires: {course.prereqs.join(", ")}
                            </div>
                          )}
                        </button>
                        {i < track.courses.length - 1 && (
                          <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8 p-6">
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm">Available (click to complete)</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm">Locked (prerequisites needed)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Progression;
