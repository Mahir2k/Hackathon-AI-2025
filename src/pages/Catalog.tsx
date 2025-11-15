import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
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

    setFilteredCourses(filtered);
  }, [search, selectedCategory, courses]);

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
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Course Catalog</h1>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
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

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {course.credits} credits
                </span>
                <span className="text-muted-foreground">
                  Difficulty: {course.difficulty}/10
                </span>
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
