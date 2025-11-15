import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { doubleMinor, minorField, doubleMajor, secondMajor } = await req.json();

    // Fetch user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("college, major")
      .eq("id", user.id)
      .single();

    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("goals, preferences")
      .eq("user_id", user.id)
      .single();

    // Fetch completed courses
    const { data: completedCourses } = await supabase
      .from("user_courses")
      .select(`courses (code, category, credits)`)
      .eq("user_id", user.id)
      .eq("completed", true);

    const completedCodes = completedCourses?.map((c: any) => c.courses.code) || [];
    const completedCredits = completedCourses?.reduce((sum: number, c: any) => sum + (c.courses?.credits || 0), 0) || 0;

    // Fetch all available courses
    const { data: allCourses } = await supabase
      .from("courses")
      .select("*")
      .order("code");

    // Calculate requirements
    const totalCreditsNeeded = 128; // Standard bachelor's degree
    const majorCredits = doubleMajor ? 48 : 36; // More credits for double major
    const minorCredits = doubleMinor ? 18 : 0;
    const remainingCredits = totalCreditsNeeded - completedCredits;

    // Determine if overload is needed (standard is 15-16 credits per semester)
    const yearsRemaining = 4;
    const semestersRemaining = yearsRemaining * 2; // Fall and Spring only
    const standardCreditsPerSemester = 15;
    const standardTotalCredits = semestersRemaining * standardCreditsPerSemester;
    const overloadNeeded = remainingCredits > standardTotalCredits;
    const overloadSemesters = overloadNeeded ? Math.ceil((remainingCredits - standardTotalCredits) / 3) : 0;
    const overloadCreditsPerSemester = overloadNeeded ? Math.ceil(remainingCredits / semestersRemaining) : 0;

    // Use Lovable AI to generate comprehensive plan
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    const systemPrompt = `You are an advanced academic planning AI. Generate a complete 4-year course plan.

Student Profile:
- Major: ${profile?.major || "Not specified"}
- ${doubleMajor ? `Second Major: ${secondMajor}` : ""}
- ${doubleMinor ? `Minor: ${minorField}` : ""}
- Completed courses: ${completedCodes.join(", ") || "None"}
- Completed credits: ${completedCredits}
- Remaining credits needed: ${remainingCredits}

Requirements:
- Total credits: ${totalCreditsNeeded}
- Major credits: ${majorCredits}${doubleMajor ? ` (split between ${profile?.major} and ${secondMajor})` : ""}
- ${doubleMinor ? `Minor credits: ${minorCredits} in ${minorField}` : ""}
- ${overloadNeeded ? `OVERLOAD REQUIRED: ${overloadSemesters} semesters at ${overloadCreditsPerSemester} credits` : "No overload needed"}

Goals: ${preferences?.goals?.join(", ") || "Not specified"}
Preferences: ${preferences?.preferences?.join(", ") || "None"}

Generate a plan for ${semestersRemaining} semesters (${yearsRemaining} years, Fall and Spring only).
For each semester, return 4-6 courses that:
1. Build progressively on prerequisites
2. Balance workload (${overloadNeeded ? overloadCreditsPerSemester : "15-16"} credits per semester)
3. Meet all degree requirements
4. ${doubleMajor ? `Include courses from both majors evenly distributed` : ""}
5. ${doubleMinor ? `Include minor courses throughout the plan` : ""}

Return JSON array format:
[
  {
    "year": 2025,
    "season": "Fall",
    "courses": ["CSE216", "MATH205", "ECO001", "ENGL002"]
  },
  ...
]`;

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate complete 4-year plan. Available courses:\n${JSON.stringify(allCourses?.slice(0, 50))}`,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API Error:", aiResponse.status, errorText);
      throw new Error(`AI generation failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0]?.message?.content || "[]";
    
    // Extract JSON array
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const semesterPlans = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Enrich with full course data
    const enrichedPlan = [];
    for (const semester of semesterPlans) {
      const { data: courses } = await supabase
        .from("courses")
        .select("id, code, name, credits, category")
        .in("code", semester.courses);

      enrichedPlan.push({
        year: semester.year,
        season: semester.season,
        courses: courses || []
      });

      // Save to database
      const courseIds = courses?.map((c) => c.id) || [];
      await supabase.from("semester_plans").upsert(
        {
          user_id: user.id,
          year: semester.year,
          season: semester.season,
          courses: courseIds,
          ai_generated: true,
        },
        {
          onConflict: "user_id,year,season",
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        plan: enrichedPlan,
        overloadInfo: {
          needed: overloadNeeded,
          semesters: overloadSemesters,
          creditsPerSemester: overloadCreditsPerSemester
        },
        message: `Generated ${semesterPlans.length} semester plan${doubleMajor ? " with double major" : ""}${doubleMinor ? " and minor" : ""}`
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
