import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Building2, Target, Settings, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CSB_MAJOR_NAME } from "@/data/csbProgram";

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

const majors = [
  "Undecided",
  "Computer Science",
  "Mechanical Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Business",
  "Economics",
  "Psychology",
  "Biology",
  CSB_MAJOR_NAME,
];

const interestAreas = [
  "Artificial Intelligence",
  "Data Science & Analytics",
  "Humanities & Social Sciences",
  "Business & Entrepreneurship",
  "Engineering & Design",
  "Health & Life Sciences",
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<string>("Undecided");
  const [selectedInterest, setSelectedInterest] = useState<string>("");
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("college, major")
      .eq("id", user.id)
      .single();

    // If user has a college set, they're returning
    if (profile?.college) {
      setIsReturningUser(true);
      setSelectedCollege(profile.college);
      setStep(2); // Skip to preferences
    }

    if (profile?.major) {
      setSelectedMajor(profile.major);
      if (profile.major === CSB_MAJOR_NAME) {
        setSelectedCollege("interdisciplinary");
      }
    }
  };

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

  const handleFinish = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update profile with college (only for new users)
    if (selectedCollege) {
      await supabase
        .from("profiles")
        .update({ college: selectedCollege, major: selectedMajor })
        .eq("id", user.id);
    }

    // Upsert preferences (always update)
    await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        goals: selectedGoals,
        preferences: [
          ...selectedPreferences,
          ...(selectedInterest ? [`interest:${selectedInterest}`] : []),
        ],
      },
      {
        onConflict: "user_id",
      }
    );

    navigate("/dashboard");
  };

  const canProceed = () => {
    if (!isReturningUser && step === 1) return selectedCollege !== "";
    if (step === 2) return selectedGoals.length > 0;
    if (step === 3) return selectedPreferences.length > 0;
    return false;
  };

  const maxSteps = isReturningUser ? 2 : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-8 shadow-lg">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          {Array.from({ length: maxSteps }, (_, i) => i + 1).map((s) => (
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

        {/* Step 1: College Selection (Skip for returning users) */}
        {!isReturningUser && step === 1 && (
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

            <div className="mt-8 max-w-md">
              <Label className="mb-2 block">Major</Label>
              <Select
                value={selectedMajor}
                onValueChange={(value) => {
                  setSelectedMajor(value);
                  if (value === CSB_MAJOR_NAME) {
                    setSelectedCollege("interdisciplinary");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your major or choose Undecided" />
                </SelectTrigger>
                <SelectContent>
                  {majors.map((major) => (
                    <SelectItem key={major} value={major}>
                      {major}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>
        )}

        {/* Step 2: Goals */}
        {((isReturningUser && step === 1) || (!isReturningUser && step === 2)) && (
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

            {selectedGoals.includes("explore") && (
              <div className="mt-8 max-w-md">
                <Label className="mb-2 block">Areas you're interested in exploring</Label>
                <Select
                  value={selectedInterest}
                  onValueChange={setSelectedInterest}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an interest area (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {interestAreas.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Preferences */}
        {(isReturningUser && step === 2) || (!isReturningUser && step === 3) && (
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

          {step < maxSteps ? (
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
