// Mülakat kaydının ham verisi (ses + kareler) yalnızca analiz süresince bellekte tutulur.
// Diske ya da navigasyon parametrelerine yazılmaz: base64 içerik megabaytlarca olabilir.

export type CaptureData = {
  /** Kaydın sesi — base64, m4a. */
  audioBase64?: string;
  /** Mülakat sırasında yakalanan kareler — base64, jpeg. */
  photos?: string[];
  /** Ses yüksekliği ölçümleri (dB). */
  dbLogs?: number[];
};

const buffer = new Map<string, CaptureData>();

export function putCapture(sessionId: string, data: CaptureData): void {
  buffer.set(sessionId, data);
}

export function takeCapture(sessionId: string): CaptureData | undefined {
  return buffer.get(sessionId);
}

/** Analiz bittikten sonra belleği boşaltır. */
export function clearCapture(sessionId: string): void {
  buffer.delete(sessionId);
}
