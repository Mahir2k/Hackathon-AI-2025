import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, Award, TrendingUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [completedCourses, setCompletedCourses] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ major: 0, hss: 0, free: 0, tech: 0 });

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate("/auth");
  };

  const fetchStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: completed } = await supabase
      .from("user_courses")
      .select("courses(category)")
      .eq("user_id", user.id)
      .eq("completed", true);

    setCompletedCourses(completed?.length || 0);

    const counts: Record<string, number> = { Major: 0, HSS: 0, Tech: 0, Free: 0 };
    completed?.forEach((c: any) => {
      if (c.courses?.category) counts[c.courses.category]++;
    });

    setProgress({
      major: Math.round((counts.Major / 12) * 100),
      hss: Math.round((counts.HSS / 7) * 100),
      tech: Math.round((counts.Tech / 4) * 100),
      free: Math.round((counts.Free / 3) * 100),
    });
  };

  const generateSemester = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-semester", {
        body: { year: new Date().getFullYear(), season: "Fall" },
      });
      if (error) throw error;
      toast({ title: "Success!", description: `Generated plan with ${data.courses.length} courses` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Track your academic progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Completed</h3>
            </div>
            <div className="text-3xl font-bold">{completedCourses}</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-accent" />
              <h3 className="font-semibold">Available</h3>
            </div>
            <div className="text-3xl font-bold">12</div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-success" />
              <h3 className="font-semibold">Progress</h3>
            </div>
            <div className="text-3xl font-bold">{Math.round((progress.major + progress.hss + progress.tech + progress.free) / 4)}%</div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => navigate("/progression")} variant="outline" className="h-auto py-4 flex-col gap-2">
              <TrendingUp className="w-6 h-6" />
              <span>Progression Tree</span>
            </Button>
            <Button onClick={() => navigate("/catalog")} variant="outline" className="h-auto py-4 flex-col gap-2">
              <BookOpen className="w-6 h-6" />
              <span>Course Catalog</span>
            </Button>
            <Button onClick={generateSemester} disabled={generating} variant="default" className="h-auto py-4 flex-col gap-2">
              <Sparkles className="w-6 h-6" />
              <span>{generating ? "Generating..." : "AI Generate Semester"}</span>
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Degree Progress</h2>
          <div className="space-y-6">
            {[
              { name: "Major Requirements", value: progress.major },
              { name: "HSS Depth & Breadth", value: progress.hss },
              { name: "Technical Electives", value: progress.tech },
              { name: "Free Electives", value: progress.free },
            ].map((req) => (
              <div key={req.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{req.name}</span>
                  <span className="text-sm text-muted-foreground">{req.value}%</span>
                </div>
                <Progress value={req.value} className="h-3" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
