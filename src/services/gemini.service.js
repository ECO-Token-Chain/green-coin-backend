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
Look at the item in this image and estimate its weight in grams when EMPTY / in its natural state (e.g., an empty plastic bottle, a dry plastic packet, a cardboard box, etc.).

IMPORTANT: Ignore any water, stones, sand, or other added material the item might contain. Only estimate the weight of the item itself.

Respond ONLY in this JSON format (no extra text):
{
  "objectName": "<name of the item>",
  "minGrams": <minimum expected weight as a number>,
  "maxGrams": <maximum expected weight as a number>
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
  };
}

module.exports = { estimateWeightRange };
