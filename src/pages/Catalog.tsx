import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, ExternalLink, Star, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCollegeForDepartment } from "@/lib/utils";
import { CSB_CATALOG_COURSES } from "@/data/csbProgram";
import { useCourseCart } from "@/contexts/CourseCartContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

interface CourseOffering {
  id: string;
  year: number;
  season: string;
  section: string | null;
  crn: string | null;
  instructor_name: string | null;
  meeting_days: string[] | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
}

interface ProfessorReview {
  id: string;
  professor_name: string;
  rating: string | null;
  helpful_count: number | null;
  comment: string;
  rmp_url: string | null;
}

const Catalog = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [departmentOptions, setDepartmentOptions] = useState<string[]>(["All"]);
  const [userCollege, setUserCollege] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [reviewsByProfessor, setReviewsByProfessor] = useState<Record<string, ProfessorReview[]>>({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { toast } = useToast();
  const {
    addCourseToCart,
    removeCourseFromCart,
    isInCart,
  } = useCourseCart();

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
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      if (!detailsOpen || !selectedCourse) return;
      setLoadingDetails(true);
      try {
        const { data: offeringData } = await supabase
          .from("course_offerings")
          .select(
            "id, year, season, section, crn, instructor_name, meeting_days, start_time, end_time, location",
          )
          .eq("course_id", selectedCourse.id)
          .order("year")
          .order("season");

        setOfferings((offeringData as any) || []);

        const { data: reviewData } = await supabase
          .from("professor_reviews")
          .select("id, professor_name, rating, helpful_count, comment, rmp_url")
          .eq("course_code", selectedCourse.code);

        const grouped: Record<string, ProfessorReview[]> = {};
        (reviewData as any[])?.forEach((r) => {
          const name = r.professor_name;
          if (!grouped[name]) grouped[name] = [];
          grouped[name].push(r);
        });

        Object.keys(grouped).forEach((name) => {
          grouped[name].sort((a, b) => {
            const hA = a.helpful_count ?? 0;
            const hB = b.helpful_count ?? 0;
            if (hB !== hA) return hB - hA;
            const rA = a.rating ? parseFloat(a.rating) : 0;
            const rB = b.rating ? parseFloat(b.rating) : 0;
            return rB - rA;
          });
          grouped[name] = grouped[name].slice(0, 3);
        });

        setReviewsByProfessor(grouped);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load instructor details",
          variant: "destructive",
        });
      } finally {
        setLoadingDetails(false);
      }
    };

    loadDetails();
  }, [detailsOpen, selectedCourse, toast]);

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

    setFilteredCourses(filtered);
  }, [search, selectedCategory, selectedDepartment, courses, userCollege]);

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
    }

    const allCourses = ensureCsbCoverage(data || []);
    setCourses(allCourses);
    setFilteredCourses(allCourses);

    const uniqueDepartments = Array.from(
      new Set(allCourses.map((c) => c.department))
    ).sort();
    setDepartmentOptions(["All", ...uniqueDepartments]);
  };

  const ensureCsbCoverage = (list: Course[]) => {
    const codes = new Set(list.map((course) => course.code));
    CSB_CATALOG_COURSES.forEach((course) => {
      if (!codes.has(course.code)) {
        list.push({
          ...course,
          category: "Major",
        });
      }
    });
    return list;
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
                {departmentOptions.map((dept) => (
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

              <Button
                variant={isInCart(course.id) ? "secondary" : "outline"}
                className="w-full mb-2 gap-2"
                onClick={() => {
                  if (isInCart(course.id)) {
                    removeCourseFromCart(course.id);
                  } else {
                    addCourseToCart({
                      id: course.id,
                      code: course.code,
                      name: course.name,
                      credits: course.credits,
                      department: course.department,
                      category: course.category,
                    });
                  }
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                {isInCart(course.id) ? "In Cart (remove)" : "Add to Cart"}
              </Button>

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
                  onClick={() => {
                    setSelectedCourse(course);
                    setDetailsOpen(true);
                  }}
                >
                  Instructors & ratings
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

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? `${selectedCourse.code} - ${selectedCourse.name}` : "Course details"}
            </DialogTitle>
            <DialogDescription>
              Course offerings by semester and top comments from RateMyProfessors (where available).
            </DialogDescription>
          </DialogHeader>

          {loadingDetails && (
            <div className="text-sm text-muted-foreground">Loading instructor details...</div>
          )}

          {!loadingDetails && selectedCourse && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Offerings</h3>
                {offerings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No scheduled offerings found in the database yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {offerings.map((offering) => (
                      <div
                        key={offering.id}
                        className="border rounded-md p-2 text-xs flex flex-col gap-1"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {offering.season} {offering.year}
                            {offering.section ? ` - Sec ${offering.section}` : ""}
                          </span>
                          {offering.crn && <span className="text-muted-foreground">CRN {offering.crn}</span>}
                        </div>
                        <div className="flex justify-between">
                          <span>{offering.instructor_name ?? "Instructor TBA"}</span>
                          {offering.meeting_days && offering.start_time && offering.end_time && (
                            <span className="text-muted-foreground">
                              {offering.meeting_days.join("")} {offering.start_time}-{offering.end_time}
                            </span>
                          )}
                        </div>
                        {offering.location && (
                          <div className="text-muted-foreground">{offering.location}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Top comments (RateMyProfessors)
                </h3>
                {Object.keys(reviewsByProfessor).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No imported RateMyProfessors comments yet.{" "}
                    <button
                      type="button"
                      className="underline underline-offset-2"
                      onClick={() =>
                        window.open(
                          `https://www.ratemyprofessors.com/search/professors?q=Lehigh%20University%20${encodeURIComponent(
                            selectedCourse.name,
                          )}`,
                          "_blank",
                        )
                      }
                    >
                      Search on RateMyProfessors
                    </button>
                    .
                  </p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {Object.entries(reviewsByProfessor).map(([profName, reviews]) => (
                      <div key={profName} className="border rounded-md p-2 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{profName}</span>
                          {reviews[0]?.rating && (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <Star className="w-3 h-3" />
                              {parseFloat(reviews[0].rating).toFixed(1)}
                            </span>
                          )}
                        </div>
                        {reviews.map((rev) => (
                          <div key={rev.id} className="mt-1">
                            <p className="text-muted-foreground">{rev.comment}</p>
                            {rev.helpful_count != null && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                {rev.helpful_count} students found this helpful
                              </p>
                            )}
                          </div>
                        ))}
                        <div className="pt-1">
                          <button
                            type="button"
                            className="underline underline-offset-2"
                            onClick={() =>
                              window.open(
                                reviews[0].rmp_url ||
                                  `https://www.ratemyprofessors.com/search/professors?q=Lehigh%20University%20${encodeURIComponent(
                                    profName,
                                  )}`,
                                "_blank",
                              )
                            }
                          >
                            View on RateMyProfessors
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Catalog;
