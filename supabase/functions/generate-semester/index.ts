import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const { year, season } = await req.json();

    // Fetch user profile and preferences
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
      .select(`
        courses (
          code,
          prerequisites
        )
      `)
      .eq("user_id", user.id)
      .eq("completed", true);

    const completedCodes = completedCourses?.map((c: any) => c.courses.code) || [];

    // Fetch available courses
    const { data: allCourses } = await supabase
      .from("courses")
      .select("*")
      .order("code");

    // Use Lovable AI to generate semester plan
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    const systemPrompt = `You are an academic advisor AI. Generate an optimal semester course plan based on student data.
Return a JSON array of 4-5 course codes that:
1. Meet prerequisites (completed: ${completedCodes.join(", ")})
2. Balance workload (target 15-18 credits)
3. Align with goals: ${preferences?.goals?.join(", ")}
4. Respect preferences: ${preferences?.preferences?.join(", ")}
5. Progress toward ${profile?.major} degree

Format: ["CSE216", "MATH205", "ECO001", "ENGL002"]`;

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
              content: `Generate optimal ${season} ${year} schedule. Available courses:\n${JSON.stringify(
                allCourses?.slice(0, 30)
              )}`,
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
    
    // Extract JSON array from response
    const jsonMatch = content.match(/\[.*?\]/s);
    const courseCodes = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    // Get course IDs
    const { data: selectedCourses } = await supabase
      .from("courses")
      .select("id, code")
      .in("code", courseCodes);

    const courseIds = selectedCourses?.map((c) => c.id) || [];

    // Create or update semester plan
    const { error: planError } = await supabase
      .from("semester_plans")
      .upsert(
        {
          user_id: user.id,
          year,
          season,
          courses: courseIds,
          ai_generated: true,
        },
        {
          onConflict: "user_id,year,season",
        }
      );

    if (planError) {
      throw planError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        courses: courseCodes,
        message: `Generated ${season} ${year} plan with ${courseCodes.length} courses`,
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
