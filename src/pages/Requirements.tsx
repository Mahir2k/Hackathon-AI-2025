import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RequirementCategory {
  name: string;
  required: number;
  completed: number;
  courses: string[];
}

const Requirements = () => {
  const [requirements, setRequirements] = useState<RequirementCategory[]>([]);
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch completed courses
    const { data: userCourses } = await supabase
      .from("user_courses")
      .select(`
        courses (
          code,
          category
        )
      `)
      .eq("user_id", user.id)
      .eq("completed", true);

    const completed = userCourses?.map((uc: any) => uc.courses.code) || [];
    setCompletedCourses(completed);

    // Fetch all courses by category
    const { data: allCourses } = await supabase
      .from("courses")
      .select("code, category");

    if (!allCourses) return;

    const categoryMap = new Map<string, string[]>();
    allCourses.forEach((course) => {
      if (!categoryMap.has(course.category)) {
        categoryMap.set(course.category, []);
      }
      categoryMap.get(course.category)?.push(course.code);
    });

    const reqData: RequirementCategory[] = [
      {
        name: "Major Requirements",
        required: 12,
        completed: completed.filter((c) =>
          categoryMap.get("Major")?.includes(c)
        ).length,
        courses: categoryMap.get("Major") || [],
      },
      {
        name: "HSS Depth & Breadth",
        required: 7,
        completed: completed.filter((c) =>
          categoryMap.get("HSS")?.includes(c)
        ).length,
        courses: categoryMap.get("HSS") || [],
      },
      {
        name: "Technical Electives",
        required: 4,
        completed: completed.filter((c) =>
          categoryMap.get("Tech")?.includes(c)
        ).length,
        courses: categoryMap.get("Tech") || [],
      },
      {
        name: "Free Electives",
        required: 3,
        completed: completed.filter((c) =>
          categoryMap.get("Free")?.includes(c)
        ).length,
        courses: categoryMap.get("Free") || [],
      },
    ];

    setRequirements(reqData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <CheckSquare className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Degree Requirements</h1>
        </div>

        {/* Overall Progress */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Overall Progress</h2>
          <div className="space-y-4">
            {requirements.map((req) => {
              const percentage = Math.round((req.completed / req.required) * 100);
              return (
                <div key={req.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{req.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {req.completed} / {req.required}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Detailed Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requirements.map((req) => (
            <Card key={req.name} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">{req.name}</h3>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <Badge variant={req.completed >= req.required ? "default" : "secondary"}>
                    {req.completed} / {req.required} courses
                  </Badge>
                </div>
                <Progress
                  value={(req.completed / req.required) * 100}
                  className="h-2"
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Available Courses:</p>
                <div className="flex flex-wrap gap-2">
                  {req.courses.slice(0, 8).map((course) => (
                    <Badge
                      key={course}
                      variant={
                        completedCourses.includes(course) ? "default" : "outline"
                      }
                    >
                      {course}
                    </Badge>
                  ))}
                  {req.courses.length > 8 && (
                    <Badge variant="outline">+{req.courses.length - 8} more</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Requirements;
