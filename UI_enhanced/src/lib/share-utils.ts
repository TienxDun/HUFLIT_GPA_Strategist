/**
 * Ultra-Binary Encoding for Roadmap State (v2.1)
 * Optimized for minimum byte count.
 */

import { type RoadmapState, type RetakeItem } from "@/hooks/useRoadmapState";

const VERSION = 4;

export function encodeRoadmapState(state: RoadmapState): string {
  try {
    const encoder = new TextEncoder();
    const buffers: Uint8Array[] = [];

    // 1. Header (8 bytes in v4)
    const currentGPAPoints = Math.round(state.currentGPA * 100);
    const targetGPAPoints = Math.round(state.targetGPA * 100);

    const header = new Uint8Array(8);
    header[0] = VERSION;
    header[1] = (currentGPAPoints >> 8) & 0xFF;
    header[2] = currentGPAPoints & 0xFF;
    header[3] = Math.min(state.currentCredits, 255);
    header[4] = (targetGPAPoints >> 8) & 0xFF;
    header[5] = targetGPAPoints & 0xFF;
    header[6] = Math.min(state.remainingCredits, 255);
    header[7] = Math.min(state.retakes.length, 255);
    buffers.push(header);

    // 2. Retakes data
    for (const item of state.retakes) {
      const nameBytes = encoder.encode(item.name || "");
      const itemMeta = new Uint8Array(4); // og(1) + c(1) + tg(1) + nameLen(1)
      itemMeta[0] = Math.round(item.oldGrade * 10);
      itemMeta[1] = Math.min(item.credits, 255);
      itemMeta[2] = item.targetGrade !== undefined ? Math.round(item.targetGrade * 10) : 255;
      itemMeta[3] = Math.min(nameBytes.length, 255);
      
      buffers.push(itemMeta);
      buffers.push(nameBytes.slice(0, 255));
    }

    // Combine
    const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const b of buffers) {
      combined.set(b, offset);
      offset += b.length;
    }

    // Base64 URL-safe
    const binaryString = Array.from(combined).map(b => String.fromCharCode(b)).join('');
    return btoa(binaryString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch (error) {
    console.error("Encode error:", error);
    return "";
  }
}

export function decodeRoadmapState(encoded: string): RoadmapState | null {
  try {
    if (!encoded) return null;
    let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binaryString = atob(b64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

    const version = bytes[0];
    let currentGPA = 0;
    let currentCredits = 0;
    let targetGPA = 0;
    let remainingCredits = 0;
    let retakeCount = 0;
    let offset = 0;

    if (version === 4) {
      const currentGPAPoints = (bytes[1] << 8) | bytes[2];
      currentGPA = currentGPAPoints / 100;
      currentCredits = bytes[3];
      const targetGPAPoints = (bytes[4] << 8) | bytes[5];
      targetGPA = targetGPAPoints / 100;
      remainingCredits = bytes[6];
      retakeCount = bytes[7];
      offset = 8;
    } else if (version === 3) {
      currentGPA = bytes[1] / 60;
      currentCredits = bytes[2];
      targetGPA = bytes[3] / 60;
      remainingCredits = bytes[4];
      retakeCount = bytes[5];
      offset = 6;
    } else {
      return null;
    }

    const retakes: RetakeItem[] = [];
    const decoder = new TextDecoder();

    for (let i = 0; i < retakeCount; i++) {
      if (offset + 4 > bytes.length) break;
      const oldGrade = bytes[offset] / 10;
      const credits = bytes[offset + 1];
      const tgRaw = bytes[offset + 2];
      const targetGrade = tgRaw === 255 ? undefined : tgRaw / 10;
      const nameLen = bytes[offset + 3];
      offset += 4;
      
      if (offset + nameLen > bytes.length) break;
      const name = decoder.decode(bytes.slice(offset, offset + nameLen));
      offset += nameLen;

      retakes.push({
        id: Math.random().toString(36).substring(2, 9),
        name: name || undefined,
        oldGrade,
        credits,
        targetGrade
      });
    }

    return { currentGPA, currentCredits, targetGPA, remainingCredits, retakes };
  } catch (error) {
    console.error("Decode error:", error);
    return null;
  }
}
