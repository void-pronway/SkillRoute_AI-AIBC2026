import { GoogleGenAI } from "@google/genai";

const apiKey = "AQ.Ab8RN6KnUClPhKk7mr1sZuo2D_iGyGzE32GeeiNJ3TAaEpSeUw";
const ai = new GoogleGenAI({ apiKey });

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  try {
    const res = await ai.models.generateContent({
      model: modelName,
      contents: "Reply with the single word: READY",
    });
    console.log(`[${modelName}] SUCCESS:`, res.text);
    return true;
  } catch (err) {
    console.log(`[${modelName}] FAILED:`, err.message);
    return false;
  }
}

async function run() {
  await testModel("gemini-3.5-flash-lite");
  await testModel("gemini-3.8-flash");
  await testModel("gemini-flash-latest");
}

run();
