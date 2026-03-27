const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sends an image to Gemini 1.5 Flash and asks it to estimate the weight range
 * of the waste item visible in the photo.
 *
 * @param {Buffer} imageBuffer - Raw image bytes
 * @param {string} mimeType    - e.g. "image/jpeg" or "image/png"
 * @returns {{ objectName: string, minGrams: number, maxGrams: number }}
 */
async function estimateWeightRange(imageBuffer, mimeType) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are a smart waste-management AI.
Look at the item in this image and:
1. Estimate its weight in grams when EMPTY / in its natural state (e.g., an empty plastic bottle, a dry plastic packet, a cardboard box).
2. Classify the waste type as either "wet" or "dry".
   - "dry" = plastics, paper, cardboard, metal, glass, e-waste, packaging, cloth, rubber, etc.
   - "wet" = food scraps, fruit/vegetable peels, cooked food, organic leftovers, tea bags, flowers, etc.

IMPORTANT: Ignore any water, stones, sand, or other added material. Only estimate the weight of the item itself.

Respond ONLY in this exact JSON format (no extra text, no markdown):
{
  "objectName": "<name of the item>",
  "minGrams": <minimum expected weight as a number>,
  "maxGrams": <maximum expected weight as a number>,
  "wasteType": "<wet or dry>"
}`;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const text = result.response.text().trim();

  // Strip markdown code fences if Gemini wraps output in ```json
  const clean = text.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch (e) {
    throw new Error(`Gemini returned non-JSON response: ${text}`);
  }

  return {
    objectName: parsed.objectName || "Unknown",
    minGrams: Number(parsed.minGrams) || 0,
    maxGrams: Number(parsed.maxGrams) || 9999,
    wasteType: parsed.wasteType === "wet" ? "wet" : "dry",
  };
}

module.exports = { estimateWeightRange };
