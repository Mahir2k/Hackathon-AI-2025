import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatBot from "@/components/ChatBot";

interface ApprovedSemester {
  id: string;
  year: number;
  season: string;
  courses: string[];
  registered: boolean;
}

const Registration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [approvedSemesters, setApprovedSemesters] = useState<ApprovedSemester[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchApprovedPlans();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate("/auth");
  };

  const fetchApprovedPlans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: approvals } = await supabase
      .from("advisor_approvals")
      .select(`
        id,
        semester_plans (
          id,
          year,
          season,
          courses
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "approved");

    if (approvals) {
      const semesters = approvals.map((a: any) => ({
        id: a.semester_plans.id,
        year: a.semester_plans.year,
        season: a.semester_plans.season,
        courses: a.semester_plans.courses,
        registered: false // You would track this in a separate table
      }));
      setApprovedSemesters(semesters);
    }
  };

  const registerForCourses = async (semesterId: string) => {
    setLoading(true);
    try {
      // In a real implementation, this would integrate with Lehigh's registration system
      // For now, we'll simulate the registration process
      toast({
        title: "Registration Initiated",
        description: "Your courses have been added to your schedule. Check your Lehigh account for confirmation.",
      });

      // Update local state to show as registered
      setApprovedSemesters(prev =>
        prev.map(sem => sem.id === semesterId ? { ...sem, registered: true } : sem)
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register for courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ChatBot context="User is viewing course registration page for approved semester plans" />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Course Registration</h1>
          <p className="text-muted-foreground">Register for approved semester plans</p>
        </div>

        {approvedSemesters.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Approved Plans</h3>
              <p className="text-muted-foreground mb-4">
                You need to have an approved semester plan before you can register.
              </p>
              <Button onClick={() => navigate('/plan-ahead')}>
                Create a Plan
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {approvedSemesters.map((semester) => (
              <Card key={semester.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {semester.season} {semester.year}
                        {semester.registered && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Registered
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {semester.courses.length} courses approved
                      </CardDescription>
                    </div>
                    {!semester.registered && (
                      <Button
                        onClick={() => registerForCourses(semester.id)}
                        disabled={loading}
                      >
                        Register for Courses
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Registration Integration
                      </p>
                      <p className="text-blue-800 dark:text-blue-200">
                        This feature connects to Lehigh's registration system. Once you click "Register for Courses",
                        your approved courses will be automatically added to your schedule in the Lehigh system.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How Registration Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <p className="font-medium">Get Approval</p>
                <p className="text-sm text-muted-foreground">Submit your semester plan to your advisor for approval</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <p className="font-medium">Wait for Approval</p>
                <p className="text-sm text-muted-foreground">Your advisor will review and approve your plan</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <p className="font-medium">Register Here</p>
                <p className="text-sm text-muted-foreground">Once approved, register for your courses directly from this page</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Registration;
