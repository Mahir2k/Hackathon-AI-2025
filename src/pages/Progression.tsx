import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle, Lock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

const tracks = [
  { id: "math", name: "Mathematics", color: "bg-blue-500", courses: [
    { code: "MATH021", name: "Calculus I", prereqs: [] },
    { code: "MATH022", name: "Calculus II", prereqs: ["MATH021"] },
    { code: "MATH205", name: "Linear Algebra", prereqs: ["MATH022"] },
  ]},
  { id: "cs", name: "CS Foundations", color: "bg-purple-500", courses: [
    { code: "CSE007", name: "Intro Programming", prereqs: [] },
    { code: "CSE017", name: "Data Structures", prereqs: ["CSE007"] },
    { code: "CSE109", name: "Systems Software", prereqs: ["CSE017"] },
  ]},
];

const Progression = () => {
  const { toast } = useToast();
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCompleted();
  }, []);

  const fetchCompleted = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("user_courses").select("courses(code)").eq("user_id", user.id).eq("completed", true);
    setCompleted(new Set(data?.map((c: any) => c.courses.code) || []));
  };

  const toggleCourse = async (code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const isCompleted = completed.has(code);
    const { data: course } = await supabase.from("courses").select("id").eq("code", code).single();
    if (!course) return;

    if (isCompleted) {
      await supabase.from("user_courses").delete().eq("user_id", user.id).eq("course_id", course.id);
      setCompleted(prev => { const next = new Set(prev); next.delete(code); return next; });
    } else {
      await supabase.from("user_courses").insert({ user_id: user.id, course_id: course.id, completed: true });
      setCompleted(prev => new Set(prev).add(code));
      toast({ title: "Course completed!", description: `${code} marked complete` });
    }
  };

  const isAvailable = (course: any) => course.prereqs.every((p: string) => completed.has(p));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-2">Course Progression</h1>
        <p className="text-muted-foreground mb-8">Complete courses to unlock new ones</p>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Progress: {completed.size} courses</h2>
          <Progress value={(completed.size / 20) * 100} className="h-3" />
        </Card>

        <div className="space-y-6">
          {tracks.map(track => (
            <Card key={track.id} className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-4 h-4 rounded ${track.color}`} />
                <h3 className="text-xl font-semibold">{track.name}</h3>
              </div>
              <div className="flex items-center gap-4 overflow-x-auto">
                {track.courses.map((course, i) => {
                  const isCompleted = completed.has(course.code);
                  const canTake = isAvailable(course);
                  return (
                    <div key={course.code} className="flex items-center gap-4">
                      <button
                        onClick={() => canTake || isCompleted ? toggleCourse(course.code) : null}
                        className={`min-w-[180px] p-4 rounded-lg border-2 transition-all ${
                          isCompleted ? "bg-green-500/10 border-green-500" :
                          canTake ? "bg-primary/10 border-primary hover:bg-primary/20 animate-pulse" :
                          "bg-muted border-border opacity-60"
                        }`}
                      >
                        <div className="absolute -top-2 -right-2">
                          {isCompleted && <CheckCircle className="w-6 h-6 text-green-500" />}
                          {!isCompleted && canTake && <Star className="w-6 h-6 text-primary" />}
                          {!isCompleted && !canTake && <Lock className="w-6 h-6 text-muted-foreground" />}
                        </div>
                        <div className="font-bold text-sm">{course.code}</div>
                        <div className="text-xs">{course.name}</div>
                      </button>
                      {i < track.courses.length - 1 && <ArrowRight className="w-6 h-6 text-muted-foreground" />}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Progression;
