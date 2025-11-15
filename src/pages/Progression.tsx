import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, CheckCircle, Lock, Star, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import ChatBot from "@/components/ChatBot";

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
  { id: "business", name: "Business Core", color: "bg-green-500", courses: [
    { code: "BUS001", name: "Business Principles", prereqs: [] },
    { code: "BUS002", name: "Business Analytics", prereqs: ["BUS001"] },
    { code: "ECO029", name: "Microeconomics", prereqs: ["BUS001"] },
  ]},
  { id: "engineering", name: "Engineering Core", color: "bg-orange-500", courses: [
    { code: "ENGR001", name: "Engineering Design", prereqs: [] },
    { code: "ENGR002", name: "Engineering Analysis", prereqs: ["ENGR001", "MATH021"] },
    { code: "ECO045", name: "Engineering Economics", prereqs: ["ECO029"] },
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
      toast({ title: "Course unlocked! 🎉", description: `${code} marked complete. New courses may now be available.` });
    }
  };

  const isAvailable = (course: any) => course.prereqs.every((p: string) => completed.has(p));

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ChatBot context="User is viewing course progression flowchart with prerequisite chains" />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
            <Star className="h-8 w-8 text-yellow-500" />
            Course Progression Flowchart
          </h1>
          <p className="text-muted-foreground">Complete courses to unlock new ones in your path</p>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Overall Progress</h2>
            <Badge variant="secondary" className="text-lg px-4 py-1">
              {completed.size} / {tracks.flatMap(t => t.courses).length} courses
            </Badge>
          </div>
          <Progress value={(completed.size / tracks.flatMap(t => t.courses).length) * 100} className="h-3" />
        </Card>

        <div className="space-y-8">
          {tracks.map(track => {
            const trackCompleted = track.courses.filter(c => completed.has(c.code)).length;
            const trackTotal = track.courses.length;
            const trackProgress = (trackCompleted / trackTotal) * 100;
            
            return (
              <Card key={track.id} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-4 h-4 rounded ${track.color}`} />
                  <h3 className="text-xl font-semibold">{track.name}</h3>
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
                            <div className="font-semibold">{course.code}</div>
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
