import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Star, Lock, RotateCcw, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  prerequisites: string[];
}

interface Track {
  id: string;
  name: string;
  color: string;
  courses: Course[];
}

const tracks: Track[] = [
  {
    id: "math",
    name: "Mathematics",
    color: "primary",
    courses: [
      { id: "math021", code: "MATH 021", name: "Calculus I", credits: 4, prerequisites: [] },
      { id: "math022", code: "MATH 022", name: "Calculus II", credits: 4, prerequisites: ["math021"] },
      { id: "math205", code: "MATH 205", name: "Linear Algebra", credits: 3, prerequisites: ["math022"] },
    ],
  },
  {
    id: "cs-foundations",
    name: "CS Foundations",
    color: "accent",
    courses: [
      { id: "cse002", code: "CSE 002", name: "Foundations of CS", credits: 4, prerequisites: [] },
      { id: "cse007", code: "CSE 007", name: "Intro to Programming", credits: 3, prerequisites: ["cse002"] },
      { id: "cse017", code: "CSE 017", name: "Data Structures", credits: 3, prerequisites: ["cse007"] },
    ],
  },
  {
    id: "systems",
    name: "Systems & Compilers",
    color: "warning",
    courses: [
      { id: "cse109", code: "CSE 109", name: "Systems Software", credits: 3, prerequisites: ["cse017"] },
      { id: "cse262", code: "CSE 262", name: "Programming Languages", credits: 3, prerequisites: ["cse109"] },
      { id: "cse404", code: "CSE 404", name: "Compiler Design", credits: 3, prerequisites: ["cse262"] },
    ],
  },
  {
    id: "theory",
    name: "Theory & ML",
    color: "success",
    courses: [
      { id: "cse140", code: "CSE 140", name: "Discrete Structures", credits: 3, prerequisites: ["math021"] },
      { id: "cse340", code: "CSE 340", name: "Algorithms", credits: 3, prerequisites: ["cse017", "cse140"] },
      { id: "cse347", code: "CSE 347", name: "Machine Learning", credits: 3, prerequisites: ["cse340", "math205"] },
    ],
  },
  {
    id: "software-eng",
    name: "Software Engineering",
    color: "destructive",
    courses: [
      { id: "cse216", code: "CSE 216", name: "Software Engineering", credits: 3, prerequisites: ["cse017"] },
      { id: "cse303", code: "CSE 303", name: "Database Systems", credits: 3, prerequisites: ["cse216"] },
      { id: "cse416", code: "CSE 416", name: "Product Engineering", credits: 3, prerequisites: ["cse303"] },
      { id: "cse498", code: "CSE 498", name: "Senior Design", credits: 3, prerequisites: ["cse416"] },
    ],
  },
];

const Progression = () => {
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());

  const isCourseAvailable = (course: Course): boolean => {
    if (completedCourses.has(course.id)) return false;
    return course.prerequisites.every(prereqId => completedCourses.has(prereqId));
  };

  const isCourseCompleted = (courseId: string): boolean => {
    return completedCourses.has(courseId);
  };

  const handleCourseClick = (course: Course) => {
    if (isCourseCompleted(course.id)) {
      toast.info("Course already completed!");
      return;
    }

    if (!isCourseAvailable(course)) {
      toast.error("Complete prerequisites first! 🔒");
      return;
    }

    setCompletedCourses(prev => {
      const newSet = new Set(prev);
      newSet.add(course.id);
      toast.success(`${course.code} completed! ✅`, {
        description: "New courses may have unlocked!",
      });
      return newSet;
    });
  };

  const handleReset = () => {
    setCompletedCourses(new Set());
    toast.info("Progress reset!");
  };

  const totalCourses = tracks.reduce((sum, track) => sum + track.courses.length, 0);
  const completedCount = completedCourses.size;
  const availableCount = tracks.reduce((sum, track) => 
    sum + track.courses.filter(c => isCourseAvailable(c) && !isCourseCompleted(c.id)).length, 0
  );

  const getColorClasses = (color: string, isCompleted: boolean, isAvailable: boolean) => {
    if (isCompleted) {
      return "bg-success text-success-foreground border-success shadow-sm";
    }
    if (isAvailable) {
      switch (color) {
        case "primary": return "bg-primary text-primary-foreground border-primary shadow-md hover:shadow-glow animate-pulse-glow";
        case "accent": return "bg-accent text-accent-foreground border-accent shadow-md hover:shadow-glow animate-pulse-glow";
        case "warning": return "bg-warning text-warning-foreground border-warning shadow-md hover:shadow-glow animate-pulse-glow";
        case "success": return "bg-success text-success-foreground border-success shadow-md hover:shadow-glow animate-pulse-glow";
        case "destructive": return "bg-destructive text-destructive-foreground border-destructive shadow-md hover:shadow-glow animate-pulse-glow";
        default: return "bg-primary text-primary-foreground border-primary shadow-md hover:shadow-glow animate-pulse-glow";
      }
    }
    return "bg-locked-bg text-locked-foreground border-locked cursor-not-allowed";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2">🎮 Course Progression Tree</h1>
            <p className="text-muted-foreground text-lg">
              Complete courses to unlock the next ones in each track. Click colored blocks to complete! ✓
            </p>
          </div>
          <Button onClick={handleReset} variant="outline" className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset Progress
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-success">{completedCount}</div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Available Now</span>
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div className="text-3xl font-bold text-warning">{availableCount}</div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary">{Math.round((completedCount / totalCourses) * 100)}%</div>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="p-4 mb-8 bg-primary/5 border-primary/20">
          <div className="text-sm space-y-2">
            <p><strong>How to Play:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Start with courses that have no prerequisites (leftmost blocks)</li>
              <li>Click a colored block to complete it ✓</li>
              <li>Watch the next course in the chain unlock with animation!</li>
              <li>Example: Click "Calculus I" → "Calculus II" unlocks → Click "Calculus II" → "Linear Algebra" unlocks</li>
            </ol>
          </div>
        </Card>

        {/* Course Tracks */}
        <div className="space-y-8">
          {tracks.map((track, trackIndex) => {
            const trackCompleted = track.courses.filter(c => isCourseCompleted(c.id)).length;
            const trackProgress = (trackCompleted / track.courses.length) * 100;

            return (
              <Card 
                key={track.id} 
                className="p-6 animate-fade-in-up"
                style={{ animationDelay: `${trackIndex * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full bg-${track.color}`}></div>
                    <h3 className="text-xl font-bold">{track.name}</h3>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {trackCompleted}/{track.courses.length}
                  </span>
                </div>

                <Progress value={trackProgress} className="h-2 mb-6" />

                <div className="flex items-center gap-4 overflow-x-auto pb-4">
                  {track.courses.map((course, idx) => {
                    const isCompleted = isCourseCompleted(course.id);
                    const isAvailable = isCourseAvailable(course);

                    return (
                      <div key={course.id} className="flex items-center gap-4">
                        <Card
                          className={`min-w-[200px] p-4 cursor-pointer transition-all hover:scale-105 border-2 ${
                            getColorClasses(track.color, isCompleted, isAvailable)
                          } ${isCompleted ? "animate-unlock" : ""}`}
                          onClick={() => handleCourseClick(course)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-bold text-sm">{course.code}</div>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 animate-bounce-subtle" />
                            ) : isAvailable ? (
                              <Star className="w-5 h-5 animate-bounce-subtle" />
                            ) : (
                              <Lock className="w-5 h-5" />
                            )}
                          </div>
                          <div className="font-medium text-xs mb-2">{course.name}</div>
                          <div className="text-xs opacity-80">{course.credits} credits</div>
                          {course.prerequisites.length > 0 && !isCompleted && (
                            <div className="text-xs mt-2 opacity-60">
                              ✓ {course.prerequisites.length} prereq{course.prerequisites.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </Card>

                        {idx < track.courses.length - 1 && (
                          <ChevronRight className={`w-6 h-6 flex-shrink-0 ${
                            isCompleted ? 'text-success' : 'text-muted-foreground/30'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Progression;
