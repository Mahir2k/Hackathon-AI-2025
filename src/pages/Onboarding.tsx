import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Building2, Target, Settings, ChevronRight, ChevronLeft } from "lucide-react";

const colleges = [
  { id: "cas", name: "College of Arts & Sciences", abbr: "CAS" },
  { id: "rceas", name: "Rossin College of Engineering", abbr: "RCEAS" },
  { id: "business", name: "College of Business", abbr: "COB" },
  { id: "interdisciplinary", name: "Interdisciplinary", abbr: "INT" },
];

const goals = [
  { id: "asap", name: "Graduate ASAP", icon: "🚀" },
  { id: "balanced", name: "Balanced Workload", icon: "⚖️" },
  { id: "explore", name: "Explore Interests", icon: "🔍" },
  { id: "gpa", name: "Keep GPA High", icon: "📈" },
];

const preferences = [
  { id: "no8am", name: "No 8AM Classes", icon: "😴" },
  { id: "max4", name: "Max 4 Classes/Day", icon: "📚" },
  { id: "highrated", name: "Highly Rated Professors", icon: "⭐" },
  { id: "lightfridays", name: "Lighter Fridays", icon: "🎉" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const handleGoalToggle = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handlePreferenceToggle = (id: string) => {
    setSelectedPreferences(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    // Store selections in localStorage or context
    localStorage.setItem("onboardingComplete", "true");
    localStorage.setItem("college", selectedCollege);
    localStorage.setItem("goals", JSON.stringify(selectedGoals));
    localStorage.setItem("preferences", JSON.stringify(selectedPreferences));
    navigate("/dashboard");
  };

  const canProceed = () => {
    if (step === 1) return selectedCollege !== "";
    if (step === 2) return selectedGoals.length > 0;
    if (step === 3) return selectedPreferences.length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-8 shadow-lg">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step
                  ? "w-12 bg-primary"
                  : s < step
                  ? "w-8 bg-success"
                  : "w-8 bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: College Selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Choose Your College</h2>
                <p className="text-muted-foreground">Select your academic college</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {colleges.map((college) => (
                <Card
                  key={college.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                    selectedCollege === college.id
                      ? "border-2 border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCollege(college.id)}
                >
                  <div className="text-2xl font-bold text-primary mb-2">{college.abbr}</div>
                  <div className="font-medium">{college.name}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">What Are Your Goals?</h2>
                <p className="text-muted-foreground">Select one or more goals (can change later)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {goals.map((goal) => (
                <Card
                  key={goal.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                    selectedGoals.includes(goal.id)
                      ? "border-2 border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <div className="text-3xl mb-2">{goal.icon}</div>
                  <div className="font-medium">{goal.name}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Preferences */}
        {step === 3 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-3xl font-bold">Set Your Preferences</h2>
                <p className="text-muted-foreground">Help us create your ideal schedule</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {preferences.map((pref) => (
                <Card
                  key={pref.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                    selectedPreferences.includes(pref.id)
                      ? "border-2 border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => handlePreferenceToggle(pref.id)}
                >
                  <div className="text-3xl mb-2">{pref.icon}</div>
                  <div className="font-medium">{pref.name}</div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={!canProceed()}
              className="gap-2"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;
