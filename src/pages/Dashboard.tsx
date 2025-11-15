import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Star, Lock, Sparkles, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface RequirementCategory {
  id: string;
  name: string;
  progress: number;
  total: number;
  color: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [requirements] = useState<RequirementCategory[]>([
    { id: "major", name: "Major Requirements", progress: 40, total: 100, color: "primary" },
    { id: "hss", name: "HSS Depth & Breadth", progress: 50, total: 100, color: "accent" },
    { id: "free", name: "Free Electives", progress: 10, total: 100, color: "warning" },
    { id: "tech", name: "Tech Electives", progress: 0, total: 100, color: "success" },
  ]);

  const totalProgress = requirements.reduce((sum, req) => sum + req.progress, 0) / requirements.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Welcome Back! 🎓</h1>
          <p className="text-muted-foreground text-lg">Your degree progress at a glance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-muted-foreground">Completed</div>
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div className="text-3xl font-bold text-success mb-1">7</div>
            <p className="text-sm text-muted-foreground">Courses finished</p>
          </Card>

          <Card className="p-6 bg-gradient-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-muted-foreground">Available</div>
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div className="text-3xl font-bold text-warning mb-1">4</div>
            <p className="text-sm text-muted-foreground">Ready to take</p>
          </Card>

          <Card className="p-6 bg-gradient-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-muted-foreground">Overall Progress</div>
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-1">{Math.round(totalProgress)}%</div>
            <p className="text-sm text-muted-foreground">Degree completion</p>
          </Card>
        </div>

        {/* Degree Progress */}
        <Card className="p-6 mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Degree Progress</h2>
            <Button variant="outline" size="sm">View Details</Button>
          </div>

          <div className="space-y-6">
            {requirements.map((req) => (
              <div key={req.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{req.name}</span>
                  <span className="text-sm text-muted-foreground">{req.progress}%</span>
                </div>
                <Progress 
                  value={req.progress} 
                  className={`h-3 ${
                    req.color === "primary" ? "[&>div]:bg-primary" :
                    req.color === "accent" ? "[&>div]:bg-accent" :
                    req.color === "warning" ? "[&>div]:bg-warning" :
                    "[&>div]:bg-success"
                  }`}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-all group animate-fade-in-up"
            onClick={() => navigate("/progression")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <div className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                Interactive
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
              Course Progression Tree
            </h3>
            <p className="text-muted-foreground mb-4">
              Explore your prerequisite paths and unlock new courses by completing requirements
            </p>
            <Button className="w-full group-hover:shadow-md transition-all">
              View Progression Map
            </Button>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-all group animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                AI-Powered
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
              Generate Semester Plan
            </h3>
            <p className="text-muted-foreground mb-4">
              Let AI create an optimized semester schedule based on your goals and preferences
            </p>
            <Button variant="outline" className="w-full group-hover:bg-accent/5 transition-all">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Plan
            </Button>
          </Card>
        </div>

        {/* Current Semester */}
        <Card className="p-6 mt-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Current Semester</h2>
            </div>
            <Button variant="outline" size="sm">Edit Schedule</Button>
          </div>

          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">No courses scheduled yet</p>
            <Button>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Your First Schedule
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
