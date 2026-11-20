import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const HARDCODED_GEMINI_KEY = "AQ.Ab8RN6KnUClPhKk7mr1sZuo2D_iGyGzE32GeeiNJ3TAaEpSeUw";
const HARDCODED_GEMINI_MODEL = "gemini-3.5-flash-lite";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    let userModel: string | null = null;

    if (user?.id) {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        select: { geminiModel: true },
      });
      userModel = profile?.geminiModel || null;
    }

    const effectiveKey = HARDCODED_GEMINI_KEY;
    const effectiveModel = userModel || process.env.GEMINI_MODEL || HARDCODED_GEMINI_MODEL;

    const maskedKey = `${effectiveKey.slice(0, 6)}...${effectiveKey.slice(-4)}`;

    return NextResponse.json({
      success: true,
      hasKey: true,
      source: "hardcoded_code",
      maskedKey,
      model: effectiveModel,
      availableModels: [
        { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite (Recommended • High Speed & Reliable)" },
        { id: "gemini-flash-latest", name: "Gemini Flash Latest" },
        { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash" },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    const { model = HARDCODED_GEMINI_MODEL, testConnection = false } = await req.json();

    const cleanKey = HARDCODED_GEMINI_KEY;
    const cleanModel = typeof model === "string" ? model.trim() : HARDCODED_GEMINI_MODEL;

    // Verify connection using official GoogleGenAI SDK
    if (testConnection) {
      try {
        const ai = new GoogleGenAI({ apiKey: cleanKey });
        const testRes = await ai.models.generateContent({
          model: cleanModel,
          contents: "Respond with the single word: OK",
        });

        if (!testRes?.text) {
          throw new Error("Empty response from Google Gemini API");
        }
      } catch (testErr: any) {
        return NextResponse.json(
          { error: `Gemini API validation failed: ${testErr.message || "Failed to reach Gemini"}` },
          { status: 400 }
        );
      }
    }

    // Save model to user's profile if logged in
    if (user?.id) {
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: {
          geminiApiKey: cleanKey,
          geminiModel: cleanModel,
        },
        create: {
          userId: user.id,
          geminiApiKey: cleanKey,
          geminiModel: cleanModel,
        },
      });
    }

    process.env.GEMINI_API_KEY = cleanKey;
    process.env.GEMINI_MODEL = cleanModel;

    return NextResponse.json({
      success: true,
      message: `Google Gemini (${cleanModel}) verified and connected!`,
      model: cleanModel,
      maskedKey: `${cleanKey.slice(0, 6)}...${cleanKey.slice(-4)}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "Reset to default Gemini 3.5 Flash-Lite engine.",
      model: HARDCODED_GEMINI_MODEL,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
