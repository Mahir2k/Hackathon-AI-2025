import { useState, useEffect } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, GripVertical, Trash2, Plus, AlertCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ChatBot from "@/components/ChatBot";
import { CSB_CATALOG_COURSES, CSB_MAJOR_NAME, CSB_PLAN_TEMPLATE } from "@/data/csbProgram";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  category: string;
}

interface SemesterPlan {
  year: number;
  season: "Fall" | "Spring" | "Summer";
  courses: Course[];
}

const SortableCourse = ({ course, onRemove }: { course: Course; onRemove: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: course.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-3 mb-2 flex items-center gap-2">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <div className="font-semibold">{course.code}</div>
        <div className="text-sm text-muted-foreground">{course.name}</div>
      </div>
      <Badge variant="secondary">{course.credits} cr</Badge>
      <Button variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

const PlanAhead = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [semesters, setSemesters] = useState<SemesterPlan[]>([]);
  const [selectedSemesterKey, setSelectedSemesterKey] = useState<string>("");
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [userMajor, setUserMajor] = useState<string | null>(null);
  const [doubleMinor, setDoubleMinor] = useState(false);
  const [minorField, setMinorField] = useState("");
  const [doubleMajor, setDoubleMajor] = useState(false);
  const [secondMajor, setSecondMajor] = useState("");
  const [advisorNotes, setAdvisorNotes] = useState("");
  const [overloadInfo, setOverloadInfo] = useState<{ needed: boolean; semesters: number; creditsPerSemester: number } | null>(null);
  const [csbPlanApplied, setCsbPlanApplied] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchCourses();
    loadExistingPlan();
    loadProfile();
  }, []);

  useEffect(() => {
    if (
      userMajor === CSB_MAJOR_NAME &&
      availableCourses.length > 0 &&
      semesters.length === 0 &&
      !csbPlanApplied
    ) {
      applyCsbPlan();
    }
  }, [userMajor, availableCourses.length, semesters.length, csbPlanApplied]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate("/auth");
  };

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("code");
    setAvailableCourses(mergeCsbCatalog(data || []));
  };

  const mergeCsbCatalog = (list: Course[]) => {
    const codes = new Set(list.map((course) => course.code));
    CSB_CATALOG_COURSES.forEach((course) => {
      if (!codes.has(course.code)) {
        list.push({
          id: course.id,
          code: course.code,
          name: course.name,
          credits: course.credits,
          category: "Major",
        } as Course);
      }
    });
    return list;
  };

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("major")
      .eq("id", user.id)
      .single();

    setUserMajor(profile?.major ?? null);
  };

  const loadExistingPlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: plans } = await supabase
      .from("semester_plans")
      .select("year, season, courses")
      .eq("user_id", user.id)
      .order("year")
      .order("season");

    if (plans && plans.length > 0) {
      const loadedSemesters: SemesterPlan[] = [];
      for (const plan of plans) {
        const { data: courses } = await supabase
          .from("courses")
          .select("id, code, name, credits, category")
          .in("id", plan.courses || []);
        
        loadedSemesters.push({
          year: plan.year,
          season: plan.season as "Fall" | "Spring" | "Summer",
          courses: courses || []
        });
      }
      setSemesters(loadedSemesters);
    }
  };

  const applyCsbPlan = () => {
    const hydrated = CSB_PLAN_TEMPLATE.map((template) => {
      const courses = template.courseCodes
        .map((code) => {
          const existing = availableCourses.find((course) => course.code === code);
          if (existing) return existing;
          const fallback = CSB_CATALOG_COURSES.find((course) => course.code === code);
          if (!fallback) return null;
          return {
            id: fallback.id,
            code: fallback.code,
            name: fallback.name,
            credits: fallback.credits,
            category: fallback.category,
          } as Course;
        })
        .filter((course): course is Course => Boolean(course));

      return {
        year: template.year,
        season: template.season,
        courses,
      };
    });

    setSemesters(hydrated);
    setCsbPlanApplied(true);
    setOverloadInfo(calculateOverloadInfo(hydrated));
    toast({
      title: "CSB 4-year plan generated",
      description: "Eight-semester plan loaded with max 18 credits per term.",
    });
  };

  const generateFourYearPlan = async () => {
    if (userMajor === "Undecided") {
      toast({
        title: "Focus on first-year courses",
        description:
          "Because you selected Undecided, start by planning a strong first-year foundation. Once you choose a major, you can generate a full 4-year plan.",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-four-year-plan", {
        body: { 
          doubleMinor, 
          minorField, 
          doubleMajor, 
          secondMajor 
        },
      });

      if (error) throw error;

      const generatedSemesters: SemesterPlan[] = data.plan.map((sem: any) => ({
        year: sem.year,
        season: sem.season,
        courses: sem.courses
      }));

      setSemesters(generatedSemesters);
      setOverloadInfo(data.overloadInfo);

      toast({ 
        title: "Success!", 
        description: `Generated 4-year plan. ${data.overloadInfo.needed ? `You'll need to overload ${data.overloadInfo.semesters} semesters with ${data.overloadInfo.creditsPerSemester} credits each.` : "No overload needed!"}` 
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent, semesterIndex: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSemesters((prevSemesters) => {
      const semester = prevSemesters[semesterIndex];
      const oldIndex = semester.courses.findIndex((c) => c.id === active.id);
      const newIndex = semester.courses.findIndex((c) => c.id === over.id);

      const newCourses = arrayMove(semester.courses, oldIndex, newIndex);
      const newSemesters = [...prevSemesters];
      newSemesters[semesterIndex] = { ...semester, courses: newCourses };
      return newSemesters;
    });
  };

  const removeCourse = (semesterIndex: number, courseId: string) => {
    setSemesters((prev) => {
      const newSemesters = [...prev];
      newSemesters[semesterIndex].courses = newSemesters[semesterIndex].courses.filter(c => c.id !== courseId);
      return newSemesters;
    });
  };

  const addEmptySemester = () => {
    const lastYear = semesters.length > 0 ? semesters[semesters.length - 1].year : new Date().getFullYear();
    const lastSeason = semesters.length > 0 ? semesters[semesters.length - 1].season : "Spring";
    
    let newYear = lastYear;
    let newSeason: "Fall" | "Spring" | "Summer" = "Fall";
    
    if (lastSeason === "Fall") {
      newSeason = "Spring";
      newYear = lastYear + 1;
    } else if (lastSeason === "Spring") {
      newSeason = "Summer";
    } else {
      newSeason = "Fall";
    }

    setSemesters([...semesters, { year: newYear, season: newSeason, courses: [] }]);
  };

  const savePlan = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      for (const semester of semesters) {
        const courseIds = semester.courses.map(c => c.id);
        await supabase.from("semester_plans").upsert({
          user_id: user.id,
          year: semester.year,
          season: semester.season,
          courses: courseIds,
          ai_generated: true
        }, {
          onConflict: "user_id,year,season"
        });
      }
      toast({ title: "Saved!", description: "Your 4-year plan has been saved." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const submitToAdvisor = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (!selectedSemesterKey) {
      toast({
        title: "Select a semester",
        description: "Choose which semester to submit for advisor review.",
        variant: "destructive",
      });
      return;
    }

    try {
      await savePlan();

      const selectedSemester = semesters.find(
        (semester) => `${semester.year}-${semester.season}` === selectedSemesterKey
      );

      if (!selectedSemester) {
        toast({
          title: "Semester not found",
          description: "Please re-select the semester and try again.",
          variant: "destructive",
        });
        return;
      }

      const { data: planData } = await supabase
        .from("semester_plans")
        .select("id")
        .eq("user_id", user.id)
        .eq("year", selectedSemester.year)
        .eq("season", selectedSemester.season)
        .single();

      if (planData) {
        await supabase.from("advisor_approvals").insert({
          user_id: user.id,
          semester_plan_id: planData.id,
          advisor_comments: advisorNotes,
          status: "pending",
        });
      }

      toast({
        title: "Submitted!",
        description: "Your semester plan has been sent to your advisor for review.",
      });
      navigate("/advisor");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getTotalCredits = (courses: Course[]) => courses.reduce((sum, c) => sum + c.credits, 0);

  const calculateOverloadInfo = (plan: SemesterPlan[]) => {
    const overloaded = plan.filter((semester) => getTotalCredits(semester.courses) > 18);
    if (overloaded.length === 0) {
      return { needed: false, semesters: 0, creditsPerSemester: 0 };
    }

    const heaviest = Math.max(...overloaded.map((semester) => getTotalCredits(semester.courses)));
    return { needed: true, semesters: overloaded.length, creditsPerSemester: heaviest };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      <ChatBot context="User is creating a 4-year academic plan with AI assistance, including double major/minor options" />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-2">Plan Ahead - 4 Year Course Plan</h1>
        <p className="text-muted-foreground mb-8">Generate and customize your complete degree plan with AI assistance</p>

        {userMajor === CSB_MAJOR_NAME && (
          <Card className="p-6 mb-6 border-primary/40 bg-primary/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase text-muted-foreground tracking-widest">
                  CSB eight-semester roadmap
                </p>
                <h2 className="text-2xl font-semibold mt-1">Computer Science & Business</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Stay on track to hit 136 credits with an 8-semester schedule capped at 18 credits per term.
                </p>
              </div>
              <Button onClick={applyCsbPlan} variant="secondary">
                Load CSB Plan
              </Button>
            </div>
          </Card>
        )}

        <Card className="p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">AI Plan Generator</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="double-major" checked={doubleMajor} onCheckedChange={(checked) => setDoubleMajor(checked === true)} />
                <Label htmlFor="double-major">Double Major</Label>
              </div>
              {doubleMajor && (
                <Input
                  placeholder="Enter second major (e.g., Computer Science)"
                  value={secondMajor}
                  onChange={(e) => setSecondMajor(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="minor" checked={doubleMinor} onCheckedChange={(checked) => setDoubleMinor(checked === true)} />
                <Label htmlFor="minor">Add Minor</Label>
              </div>
              {doubleMinor && (
                <Input
                  placeholder="Enter minor field (e.g., Data Science)"
                  value={minorField}
                  onChange={(e) => setMinorField(e.target.value)}
                />
              )}
            </div>
          </div>

          <Button onClick={generateFourYearPlan} disabled={generating} className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            {generating ? "Generating..." : "Generate 4-Year Plan with AI"}
          </Button>

          {overloadInfo && overloadInfo.needed && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-semibold">Overload Required</p>
                <p className="text-sm text-muted-foreground">
                  To graduate on time, you'll need to overload {overloadInfo.semesters} semester(s) with approximately {overloadInfo.creditsPerSemester} credits each.
                </p>
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {semesters.map((semester, index) => (
            <Card key={`${semester.year}-${semester.season}`} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{semester.season} {semester.year}</h3>
                  <p className="text-sm text-muted-foreground">{getTotalCredits(semester.courses)} credits</p>
                </div>
              </div>

              <DndContext collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, index)}>
                <SortableContext items={semester.courses.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {semester.courses.map((course) => (
                      <SortableCourse
                        key={course.id}
                        course={course}
                        onRemove={() => removeCourse(index, course.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {semester.courses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No courses scheduled
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <Button onClick={addEmptySemester} variant="outline" className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Add Semester
          </Button>
          <Button onClick={savePlan} variant="secondary" className="flex-1">
            Save Plan
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Submit to Advisor</h2>
          <div className="space-y-4">
            {semesters.length > 0 && (
              <div className="space-y-2">
                <Label>Semester to submit</Label>
                <Select
                  value={selectedSemesterKey}
                  onValueChange={setSelectedSemesterKey}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => {
                      const key = `${semester.year}-${semester.season}`;
                      return (
                        <SelectItem key={key} value={key}>
                          {semester.season} {semester.year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label htmlFor="notes">Notes for Advisor</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or questions for your advisor..."
                value={advisorNotes}
                onChange={(e) => setAdvisorNotes(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={submitToAdvisor} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Submit Plan for Advisor Review
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PlanAhead;
