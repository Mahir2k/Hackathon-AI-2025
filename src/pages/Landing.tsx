import { Button } from "@/components/ui/button";
import { GraduationCap, Brain, Trophy, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Academic Planning</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Navigate Your
            <br />
            Degree Journey
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform complex degree requirements into an interactive, game-like experience. 
            Complete courses, unlock new opportunities, and stay on track to graduation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-lg hover:shadow-glow transition-all"
              onClick={() => navigate("/auth")}
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Start Your Journey
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => navigate("/dashboard")}
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
          <div className="bg-card p-6 rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Game-Like Progression</h3>
            <p className="text-muted-foreground">
              Complete courses to unlock new opportunities. Watch your academic path unfold like levels in a game.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Planning</h3>
            <p className="text-muted-foreground">
              Get personalized semester recommendations based on your goals, preferences, and graduation timeline.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
            <p className="text-muted-foreground">
              Visual progress bars and requirement tracking keep you informed and motivated throughout your journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
