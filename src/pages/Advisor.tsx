import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { FileCheck, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApprovalRequest {
  id: string;
  status: string;
  submitted_at: string;
  advisor_comments: string | null;
  semester_plans: {
    year: number;
    season: string;
  };
}

const Advisor = () => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [newRequest, setNewRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("advisor_approvals")
      .select(`
        *,
        semester_plans (
          year,
          season
        )
      `)
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch approval requests",
        variant: "destructive",
      });
    } else {
      setRequests(data || []);
    }
  };

  const submitRequest = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create a semester plan first
    const currentYear = new Date().getFullYear();
    const { data: planData, error: planError } = await supabase
      .from("semester_plans")
      .insert({
        user_id: user.id,
        year: currentYear,
        season: "Fall",
        courses: [],
      })
      .select()
      .single();

    if (planError || !planData) {
      toast({
        title: "Error",
        description: "Failed to create semester plan",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Submit approval request
    const { error } = await supabase
      .from("advisor_approvals")
      .insert({
        user_id: user.id,
        semester_plan_id: planData.id,
        status: "pending",
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Approval request submitted!",
      });
      setNewRequest("");
      fetchRequests();
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileCheck className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Advisor Approval</h1>
        </div>

        {/* Submit New Request */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Submit New Request</h2>
          <Textarea
            placeholder="Add any notes for your advisor..."
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
            className="mb-4"
            rows={4}
          />
          <Button onClick={submitRequest} disabled={loading} className="gap-2">
            <Send className="w-4 h-4" />
            Submit for Approval
          </Button>
        </Card>

        {/* Previous Requests */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Request History</h2>
          
          {requests.map((request) => (
            <Card key={request.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">
                      {request.semester_plans.season} {request.semester_plans.year}
                    </h3>
                    <Badge className={`${getStatusColor(request.status)} gap-1`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Submitted {new Date(request.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {request.advisor_comments && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Advisor Comments:</p>
                  <p className="text-sm text-muted-foreground">
                    {request.advisor_comments}
                  </p>
                </div>
              )}
            </Card>
          ))}

          {requests.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No approval requests yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Advisor;
