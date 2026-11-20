import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_MODEL = "gemini-3.5-flash-lite";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser();
    let userModel: string | null = null;
    let userKey: string | null = null;

    if (user?.id) {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        select: { geminiApiKey: true, geminiModel: true },
      });
      userModel = profile?.geminiModel || null;
      userKey = profile?.geminiApiKey || null;
    }

    const effectiveKey = (userKey || process.env.GEMINI_API_KEY || "").trim();
    const effectiveModel = userModel || process.env.GEMINI_MODEL || DEFAULT_MODEL;

    const isValid = Boolean(effectiveKey && (effectiveKey.startsWith("AIzaSy") || effectiveKey.startsWith("AQ.")) && effectiveKey.length >= 35);
    const maskedKey = isValid
      ? `${effectiveKey.slice(0, 6)}...${effectiveKey.slice(-4)}`
      : "";

    return NextResponse.json({
      success: true,
      hasKey: isValid,
      source: userKey ? "user_profile" : process.env.GEMINI_API_KEY ? "env_variable" : "deterministic_mode",
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
    const { apiKey, model = DEFAULT_MODEL, testConnection = false } = await req.json();

    const cleanModel = typeof model === "string" ? model.trim() : DEFAULT_MODEL;
    let keyToUse = typeof apiKey === "string" ? apiKey.trim() : "";

    // If apiKey is masked, keep existing configured key
    if (!keyToUse || keyToUse.includes("...")) {
      keyToUse = (process.env.GEMINI_API_KEY || "").trim();
      if (!keyToUse && user?.id) {
        const p = await prisma.studentProfile.findUnique({
          where: { userId: user.id },
          select: { geminiApiKey: true },
        });
        keyToUse = (p?.geminiApiKey || "").trim();
      }
    }

    // Validate key structure if provided
    if (keyToUse && !keyToUse.startsWith("AIzaSy") && !keyToUse.startsWith("AQ.")) {
      return NextResponse.json(
        { error: "Invalid Google Gemini API key format. Official keys from Google AI Studio (aistudio.google.com) start with 'AIzaSy' or 'AQ.'." },
        { status: 400 }
      );
    }

    // Verify connection using official GoogleGenAI SDK if key is valid
    if (testConnection && keyToUse) {
      try {
        const ai = new GoogleGenAI({ apiKey: keyToUse });
        const testRes = await ai.models.generateContent({
          model: cleanModel,
          contents: "Respond with the single word: OK",
        });

        if (!testRes?.text) {
          throw new Error("Empty response from Google Gemini API");
        }
      } catch (testErr: any) {
        let msg = "Failed to reach Gemini";
        try {
          if (typeof testErr.message === "string" && testErr.message.includes("{")) {
            const p = JSON.parse(testErr.message.slice(testErr.message.indexOf("{")));
            msg = p?.error?.message || msg;
          } else {
            msg = testErr.message || msg;
          }
        } catch {
          msg = testErr.message || msg;
        }
        return NextResponse.json(
          { error: `Gemini API validation failed: ${msg}` },
          { status: 400 }
        );
      }
    }

    // Save key & model to user's profile if logged in
    if (user?.id) {
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: {
          geminiApiKey: keyToUse || null,
          geminiModel: cleanModel,
        },
        create: {
          userId: user.id,
          geminiApiKey: keyToUse || null,
          geminiModel: cleanModel,
        },
      });
    }

    if (keyToUse) {
      process.env.GEMINI_API_KEY = keyToUse;
    }
    process.env.GEMINI_MODEL = cleanModel;

    return NextResponse.json({
      success: true,
      message: keyToUse
        ? `Google Gemini (${cleanModel}) verified and connected!`
        : `Model updated to ${cleanModel} (Deterministic guidance mode).`,
      model: cleanModel,
      maskedKey: keyToUse ? `${keyToUse.slice(0, 6)}...${keyToUse.slice(-4)}` : "",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (user?.id) {
      await prisma.studentProfile.update({
        where: { userId: user.id },
        data: { geminiApiKey: null },
      });
    }
    delete process.env.GEMINI_API_KEY;
    return NextResponse.json({
      success: true,
      message: "Reset to default deterministic guidance mode.",
      model: DEFAULT_MODEL,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
