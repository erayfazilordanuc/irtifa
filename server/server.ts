import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Bu sunucu bir Gemini anahtarını taşıyor ve yerel ağa açık dinliyor (0.0.0.0).
// Üç koruma: tarayıcı kaynağı kısıtı, gerçekçi bir boyut sınırı ve isteğe bağlı
// paylaşılan bir jeton. Hiçbiri olmadan aynı Wi-Fi'daki herkes anahtarı harcayabilir.

// Yalnızca izin verilen kaynaklar. Mobil uygulama Origin başlığı göndermediği için
// (React Native fetch) origin'siz istekler geçiyor; kısıt tarayıcılar için anlamlı.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((o: string) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.length === 0) return callback(null, false);
      return callback(null, ALLOWED_ORIGINS.includes(origin));
    },
  }),
);

// 50mb bir mülakat kaydı için fazlasıyla geniş. Ses + kareler base64 olarak
// ~8mb'ı geçmiyor; sınırı buna göre daraltıyoruz.
app.use(express.json({ limit: process.env.MAX_PAYLOAD ?? "12mb" }));

/**
 * İsteğe bağlı paylaşılan jeton. `.env` içinde APP_TOKEN tanımlıysa uygulamanın
 * her istekte `x-app-token` başlığıyla aynı değeri göndermesi gerekir.
 * Tanımlı değilse (varsayılan geliştirme kurulumu) kontrol atlanır.
 */
app.use("/api", (req, res, next) => {
  const expected = process.env.APP_TOKEN;
  if (!expected) return next();
  if (req.header("x-app-token") === expected) return next();
  return res.status(401).json({
    success: false,
    error: "UNAUTHORIZED",
    message: "Geçersiz veya eksik uygulama jetonu.",
  });
});

/**
 * Kaba hız sınırı: istemci (IP) başına kayan pencerede en fazla N istek.
 * `express-rate-limit` yerine birkaç satır — sunucu ek bağımlılık istemesin
 * (kök projede `npm install` patch-package tuzağına düşüyor, DEVAM.md).
 * Tek süreçlik bellek içi sayaç; birden fazla örnekle çalışılacaksa paylaşılan
 * bir depoya (Redis vb.) taşınmalı.
 */
const RATE_WINDOW_MS = Number(process.env.RATE_WINDOW_MS ?? 60_000);
const RATE_MAX = Number(process.env.RATE_MAX ?? 20);
const hits = new Map<string, number[]>();

app.use("/api", (req, res, next) => {
  const key = req.ip ?? "bilinmiyor";
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    res.setHeader("Retry-After", Math.ceil(RATE_WINDOW_MS / 1000));
    return res.status(429).json({
      success: false,
      error: "RATE_LIMITED",
      message: "Çok fazla istek gönderildi. Biraz sonra tekrar deneyin.",
    });
  }
  recent.push(now);
  hits.set(key, recent);
  return next();
});

/** Gemini çağrısının üst süresi — aşılırsa 504 döner, istemci çevrimdışı yola düşer. */
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS ?? 15_000);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Object.assign(new Error("Yapay zekâ isteği zaman aşımına uğradı."), { status: 504 })),
      ms,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

// Lazy-initialize Gemini SDK to avoid startup crashes if key is initially absent
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Universal Proxy Endpoint for Gemini API
app.post("/api/gemini", async (req, res) => {
  const { model, contents, config, audioBase64, capturedPhotos, dbLogs } = req.body;
  
  const ai = getGeminiClient();
  
  if (!ai) {
    return res.status(401).json({ 
      success: false, 
      error: "API_KEY_MISSING",
      message: "Sunucuda geçerli bir GEMINI_API_KEY tanımlanmamış."
    });
  }

  try {
    let geminiContents: any = contents;
    
    // Ses veya fotoğraf varsa Gemini'ye çoklu-medya (multimodal) formatında gönderiyoruz
    if (audioBase64 || (capturedPhotos && capturedPhotos.length > 0)) {
      let finalPrompt = typeof contents === 'string' ? contents : JSON.stringify(contents);
      
      if (dbLogs && dbLogs.length > 0) {
        finalPrompt += `\n\nSES YÜKSEKLİĞİ LOGLARI (dB):\n` + JSON.stringify(dbLogs);
        finalPrompt += `\nYukarıdaki desibel loglarını inceleyerek adayın mülakatta sesini nasıl kullandığını (bağırma, fısıldama, ani tepkiler) değerlendir.`;
      }
      
      geminiContents = [{ role: "user", parts: [{ text: finalPrompt }] }];
      
      if (audioBase64) {
        geminiContents[0].parts.push({
          inlineData: {
            data: audioBase64,
            // "audio/m4a" IANA'da kayıtlı değil ve Gemini'nin desteklediği
            // türler arasında yok; m4a kabı için doğru tür audio/mp4.
            mimeType: "audio/mp4"
          }
        });
      }
      
      if (capturedPhotos) {
        capturedPhotos.forEach((b64: string) => {
          geminiContents[0].parts.push({
            inlineData: {
              data: b64,
              mimeType: "image/jpeg"
            }
          });
        });
      }
    }

    const response = await withTimeout(
      ai.models.generateContent({
        model: model || "gemini-2.5-flash",
        contents: geminiContents,
        config: config,
      }),
      REQUEST_TIMEOUT_MS,
    );

    const outputText = response.text ? response.text.trim() : "";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    return res.json({
      success: true,
      text: outputText,
      groundingMetadata: groundingMetadata
    });

  } catch (error: any) {
    console.error("Gemini API Proxy Exception:", error);
    
    return res.status(error.status || 500).json({
      success: false,
      error: error.message || "Yapay zeka analiz motoru yanıt veremedi.",
      status: error.status
    });
  }
});

async function startServer() {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[İrtifa Express Server Proxy] running on http://localhost:${PORT}`);
  });
}

startServer();
