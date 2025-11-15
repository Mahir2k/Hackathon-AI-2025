import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCollegeForDepartment } from "@/lib/utils";

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  category: string;
  department: string;
  prerequisites: string[];
  difficulty: number;
  workload_hours: number;
}

const Catalog = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [userCollege, setUserCollege] = useState<string | null>(null);
  const [userMajor, setUserMajor] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("college, major")
        .eq("id", user.id)
        .single();

      setUserCollege(profile?.college ?? null);
      setUserMajor(profile?.major ?? null);
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    let filtered = courses;
    
    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.department.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    if (selectedDepartment !== "All") {
      filtered = filtered.filter((c) => c.department === selectedDepartment);
    }

    if (userCollege) {
      filtered = filtered.filter((c) => {
        const courseCollege = getCollegeForDepartment(c.department);
        return !courseCollege || courseCollege === userCollege;
      });
    }

    if (userMajor && userMajor !== "Undecided") {
      filtered = filtered.filter((c) => c.department === userMajor);
    }

    setFilteredCourses(filtered);
  }, [search, selectedCategory, selectedDepartment, courses]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("code");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    } else {
      setCourses(data || []);
      setFilteredCourses(data || []);
    }
  };

  const categories = ["All", "Major", "HSS", "Tech", "Free"];
  const departments = ["All", "Computer Science", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Chemical Engineering", "Business", "Economics", "Psychology", "Biology"];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Major":
        return "bg-blue-500";
      case "HSS":
        return "bg-purple-500";
      case "Tech":
        return "bg-red-500";
      case "Free":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Course Catalog</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open("https://catalog.lehigh.edu/courselisting/", "_blank")
            }
          >
            Official Catalog
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat)}
                    size="sm"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Department / Major</label>
              <div className="flex gap-2 flex-wrap">
                {departments.map((dept) => (
                  <Button
                    key={dept}
                    variant={selectedDepartment === dept ? "default" : "outline"}
                    onClick={() => setSelectedDepartment(dept)}
                    size="sm"
                  >
                    {dept}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="p-4 hover:shadow-md transition-all hover:border-primary/50"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-lg">{course.code}</div>
                  <div className="text-sm text-muted-foreground">
                    {course.department}
                  </div>
                </div>
                <Badge className={getCategoryColor(course.category)}>
                  {course.category}
                </Badge>
              </div>

              <h3 className="font-semibold mb-2">{course.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {course.credits} credits
                </span>
                {course.difficulty && (
                  <span className="text-muted-foreground">
                    Difficulty: {course.difficulty}/10
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <button
                  type="button"
                  className="underline-offset-2 hover:underline"
                  onClick={() =>
                    window.open(
                      "https://catalog.lehigh.edu/courselisting/",
                      "_blank"
                    )
                  }
                >
                  View in catalog
                </button>
                <button
                  type="button"
                  className="underline-offset-2 hover:underline"
                  onClick={() =>
                    window.open(
                      `https://www.ratemyprofessors.com/search/professors?q=Lehigh%20University`,
                      "_blank"
                    )
                  }
                >
                  Rate My Professors
                </button>
              </div>

              {course.prerequisites.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Prerequisites: {course.prerequisites.join(", ")}
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No courses found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
