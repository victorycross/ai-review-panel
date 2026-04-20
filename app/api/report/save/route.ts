import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { intake, clarifyingQa, report } = await request.json();

  if (!report || !intake) {
    return NextResponse.json({ error: "Missing report or intake data." }, { status: 400 });
  }

  const { data: assessment, error: assessmentError } = await supabase
    .from("assessments")
    .insert({
      user_id: user.id,
      system_name: report.systemName,
      vendor: report.vendor ?? "",
      intake_data: intake,
      clarifying_qa: clarifyingQa ?? [],
      status: "complete",
    })
    .select()
    .single();

  if (assessmentError) {
    return NextResponse.json(
      { error: "Failed to save assessment." },
      { status: 500 }
    );
  }

  const { error: reportError } = await supabase.from("reports").insert({
    assessment_id: assessment.id,
    user_id: user.id,
    report_data: report,
    overall_risk: report.overallRisk,
  });

  if (reportError) {
    return NextResponse.json({ error: "Failed to save report." }, { status: 500 });
  }

  return NextResponse.json({ assessmentId: assessment.id });
}
