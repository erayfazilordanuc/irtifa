require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: "AIzaSyDummyKeyDummyKeyDummyKeyDummyKeyD" });
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Test",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            rating: { type: "INTEGER", description: "Technical and stress score out of 100." },
            defenseResilience: { type: "STRING", description: "Overall stress tolerance and defense mindset evaluation. (e.g. 'Çok Yüksek', 'Yüksek / Sabırlı', 'Geliştirilmeli')" },
            postureFeedback: { type: "STRING", description: "Analysis of candidates eye contact, head movement, stable camera tracking." },
            fluencyFeedback: { type: "STRING", description: "Review of Turkish fluency, speed, filler counts, or continuous keyboard stream under backspace limitation." },
            depthFeedback: { type: "STRING", description: "Deep engineering review. Did employee clarify physical parameters or just generic stuff? Speak specific terms." },
            fillerRating: { type: "STRING", description: "Status label for speech precision (e.g. 'Sarsılmaz Hitabet', 'Kabul Edilebilir', 'Kontrol Altına Alınmalı')" },
            successPoints: { type: "ARRAY", items: { type: "STRING" }, description: "Two major technical or behavioral strengths demonstrated by the candidate." },
            improvementPoints: { type: "ARRAY", items: { type: "STRING" }, description: "Two precise, actionable recommendations to build greater technical poise." },
            finalVerdict: { type: "STRING", description: "A summary evaluation sentence with Turkish military poise." },
            idealAnswer: { type: "STRING", description: "An example ideal, technically accurate, and structured answer to the question asked." }
          },
          required: ["rating", "defenseResilience", "postureFeedback", "fluencyFeedback", "depthFeedback", "fillerRating", "successPoints", "improvementPoints", "finalVerdict", "idealAnswer"]
        }
      }
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
