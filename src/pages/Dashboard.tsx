import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Calendar, TrendingUp, GraduationCap } from "lucide-react";
import Navigation from "@/components/Navigation";
import ChatBot from "@/components/ChatBot";
import { useToast } from "@/hooks/use-toast";

interface CurrentCourse {
  userCourseId: string;
  code: string;
  name: string;
  credits: number | null;
  semesterYear: number | null;
  semesterSeason: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [completedCourses, setCompletedCourses] = useState(0);
  const [availableCourses, setAvailableCourses] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [majorProgress, setMajorProgress] = useState(0);
  const [hssProgress, setHssProgress] = useState(0);
  const [techProgress, setTechProgress] = useState(0);
  const [freeProgress, setFreeProgress] = useState(0);
  const [currentCourses, setCurrentCourses] = useState<CurrentCourse[]>([]);
  const { toast } = useToast();

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

    const major = Math.round((counts.Major / 12) * 100);
    const hss = Math.round((counts.HSS / 7) * 100);
    const tech = Math.round((counts.Tech / 4) * 100);
    const free = Math.round((counts.Free / 3) * 100);

    setMajorProgress(major);
    setHssProgress(hss);
    setTechProgress(tech);
    setFreeProgress(free);
    setProgressPercentage(Math.round((major + hss + tech + free) / 4));

    const { data: allCourses } = await supabase.from("courses").select("id");
    setAvailableCourses((allCourses?.length || 0) - completedCourses);

    const { data: current } = await supabase
      .from("user_courses")
      .select("id, semester_year, semester_season, courses(code, name, credits)")
      .eq("user_id", user.id)
      .eq("completed", false);

    const mapped: CurrentCourse[] =
      current?.map((row: any) => ({
        userCourseId: row.id,
        code: row.courses?.code,
        name: row.courses?.name,
        credits: row.courses?.credits ?? null,
        semesterYear: row.semester_year,
        semesterSeason: row.semester_season,
      })) || [];

    setCurrentCourses(mapped);
  };

  const handleDropCourse = async (userCourseId: string) => {
    try {
      await supabase.from("user_courses").delete().eq("id", userCourseId);
      setCurrentCourses((prev) =>
        prev.filter((course) => course.userCourseId !== userCourseId)
      );
      toast({
        title: "Course dropped",
        description: "This course has been removed from your current schedule.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to drop course",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ChatBot context="User is viewing their dashboard with course statistics and progress" />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
            <GraduationCap className="h-8 w-8" />
            Academic Dashboard
          </h1>
          <p className="text-muted-foreground">Track your progress and plan your path to graduation</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Completed Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{completedCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Available Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{availableCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{progressPercentage}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Button 
            onClick={() => navigate('/progression')} 
            variant="outline"
            className="h-auto py-6"
          >
            <div className="text-center w-full">
              <div className="font-semibold mb-1">Course Progression</div>
              <div className="text-xs text-muted-foreground">View your course flowchart</div>
            </div>
          </Button>

          <Button 
            onClick={() => navigate('/plan-ahead')}
            variant="outline"
            className="h-auto py-6"
          >
            <div className="text-center w-full">
              <div className="font-semibold mb-1">Plan Ahead</div>
              <div className="text-xs text-muted-foreground">Create your 4-year plan</div>
            </div>
          </Button>

          <Button 
            onClick={() => navigate('/catalog')}
            variant="outline"
            className="h-auto py-6"
          >
            <div className="text-center w-full">
              <div className="font-semibold mb-1">Course Catalog</div>
              <div className="text-xs text-muted-foreground">Browse all courses</div>
            </div>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Degree Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Major Requirements</span>
                <span className="text-sm text-muted-foreground">{majorProgress}%</span>
              </div>
              <Progress value={majorProgress} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">HSS Depth & Breadth</span>
                <span className="text-sm text-muted-foreground">{hssProgress}%</span>
              </div>
              <Progress value={hssProgress} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Technical Electives</span>
                <span className="text-sm text-muted-foreground">{techProgress}%</span>
              </div>
              <Progress value={techProgress} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Free Electives</span>
                <span className="text-sm text-muted-foreground">{freeProgress}%</span>
              </div>
              <Progress value={freeProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {currentCourses.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentCourses.map((course) => (
                <div
                  key={course.userCourseId}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {course.code} · {course.name}
                    </div>
                    {course.semesterSeason && (
                      <div className="text-xs text-muted-foreground">
                        {course.semesterSeason} {course.semesterYear}
                        {course.credits ? ` · ${course.credits} credits` : ""}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDropCourse(course.userCourseId)}
                  >
                    Drop
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
