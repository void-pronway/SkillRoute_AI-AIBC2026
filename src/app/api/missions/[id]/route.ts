import { NextRequest, NextResponse } from "next/server";
import { getChallengeById } from "@/data/challenges";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const challenge = getChallengeById(params.id);
    if (!challenge) {
      return NextResponse.json({ error: "Mission challenge not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      challenge,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
