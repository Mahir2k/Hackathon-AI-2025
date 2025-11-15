import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCheck, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ChatBot from "@/components/ChatBot";

interface ApprovalRequest {
  id: string;
  status: string;
  submitted_at: string;
  advisor_comments: string | null;
  semester_plans: { year: number; season: string; };
}

const Advisor = () => {
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [availableSemesters, setAvailableSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    fetchAvailableSemesters();
  }, []);

  const fetchRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("advisor_approvals").select("*, semester_plans(year, season)").eq("user_id", user.id).order("submitted_at", { ascending: false });
    setRequests(data || []);
  };

  const fetchAvailableSemesters = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: plans } = await supabase.from("semester_plans").select("id, year, season").eq("user_id", user.id);
    const { data: existingApprovals } = await supabase.from("advisor_approvals").select("semester_plan_id").eq("user_id", user.id);
    const existingIds = new Set(existingApprovals?.map(a => a.semester_plan_id) || []);
    setAvailableSemesters(plans?.filter(p => !existingIds.has(p.id)) || []);
  };

  const submitRequest = async () => {
    if (!selectedSemester) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("advisor_approvals").insert({ user_id: user!.id, semester_plan_id: selectedSemester, status: "pending" });
    if (!error) {
      toast({ title: "Success", description: "Semester submitted for approval!" });
      setSelectedSemester("");
      fetchRequests();
      fetchAvailableSemesters();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <ChatBot context="User is submitting semester plans for advisor approval" />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 flex items-center gap-3">
          <FileCheck className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Advisor Approval</h1>
        </div>
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Submit Semester for Approval</h2>
          <div className="space-y-4">
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger><SelectValue placeholder="Choose semester" /></SelectTrigger>
              <SelectContent>
                {availableSemesters.map(s => <SelectItem key={s.id} value={s.id}>{s.season} {s.year}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Notes for advisor..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            <Button onClick={submitRequest} disabled={loading || !selectedSemester} className="gap-2 w-full"><Send className="w-4 h-4" />Submit</Button>
          </div>
        </Card>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Request History</h2>
          {requests.map(r => (
            <Card key={r.id} className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{r.semester_plans.season} {r.semester_plans.year}</h3>
                <Badge>{r.status === "pending" ? <Clock className="w-4 h-4" /> : r.status === "approved" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {r.status}</Badge>
              </div>
              {r.advisor_comments && <div className="mt-4 p-4 bg-muted rounded-lg"><p className="text-sm">{r.advisor_comments}</p></div>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Advisor;
