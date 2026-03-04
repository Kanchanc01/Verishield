import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, MediaType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

/**
 * Forensic analysis schema for structured output.
 * Designed to capture specific artifacts typical of synthetic media.
 */
const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    confidenceScore: {
      type: Type.NUMBER,
      description: "Probability score (0-100) of the content being AI-generated.",
    },
    summary: {
      type: Type.STRING,
      description: "Executive summary of the forensic findings.",
    },
    indicators: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Technical name of the detected artifact." },
          description: { type: Type.STRING, description: "Forensic explanation of the artifact." },
          severity: { 
            type: Type.STRING, 
            enum: ["low", "medium", "high"],
            description: "Impact of this artifact on the overall confidence score."
          },
        },
        required: ["label", "description", "severity"],
      },
    },
    isAI: {
      type: Type.BOOLEAN,
      description: "Binary classification based on the detection threshold.",
    },
    metadata: {
      type: Type.OBJECT,
      properties: {
        modelVersion: { type: Type.STRING },
        analysisLatency: { type: Type.NUMBER },
        forensicHash: { type: Type.STRING }
      }
    }
  },
  required: ["confidenceScore", "summary", "indicators", "isAI"],
};

/**
 * Executes a multi-modal forensic scan using the Gemini engine.
 */
export async function analyzeContent(
  type: MediaType,
  content: string,
  mimeType?: string
): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  const startTime = Date.now();
  
  const prompts: Record<MediaType, string> = {
    text: `Perform a deep linguistic forensic analysis on the provided text. 
      Identify markers of Large Language Model (LLM) generation, including:
      - Statistical improbability in word choice (perplexity/burstiness).
      - Over-reliance on transitional phrases and "safe" conclusions.
      - Lack of idiosyncratic human errors or specific cultural nuances.
      - Structural symmetry and repetitive syntactic patterns.`,
    
    image: `Perform a pixel-level forensic analysis on this image. 
      Scan for generative AI artifacts and deepfake markers:
      - Frequency domain anomalies (checkerboard artifacts).
      - Biological inconsistencies (iris asymmetry, earlobe mismatch, unnatural hair-to-skin blending).
      - Environmental hallucinations (warped background geometry, inconsistent light vectors).
      - Semantic errors (impossible physics, merged limbs, floating objects).`,
    
    audio: `Analyze the provided audio metadata and description for signs of synthetic voice cloning or speech synthesis.
      Focus on:
      - Spectral consistency and unnatural silence gaps.
      - Lack of micro-prosody (natural human breath and pitch micro-variations).
      - Robotic cadence or inconsistent emotional tone.`,
    
    video: `Analyze the video metadata for signs of temporal inconsistency typical of deepfakes.
      Focus on:
      - Frame-to-frame jitter in facial landmarks.
      - Inconsistent lighting between the subject and the environment.
      - Unnatural eye-blinking patterns or lip-sync misalignment.`
  };

  const parts: any[] = [{ text: prompts[type] }];

  if (type === 'image') {
    parts.push({
      inlineData: {
        data: content.split(',')[1] || content,
        mimeType: mimeType || "image/jpeg",
      },
    });
  } else if (type === 'text') {
    parts.push({ text: `CONTENT TO ANALYZE:\n${content}` });
  } else {
    parts.push({ text: `METADATA/DESCRIPTION:\n${content}` });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    if (!response.text) {
      throw new Error("Empty response from analysis engine.");
    }

    const result = JSON.parse(response.text);
    
    // Inject technical metadata for the "Senior" feel
    return {
      ...result,
      metadata: {
        modelVersion: "G3-FORENSIC-PRO-V1",
        analysisLatency: Date.now() - startTime,
        forensicHash: Math.random().toString(16).substring(2, 10).toUpperCase()
      }
    } as AnalysisResult;
  } catch (error) {
    console.error("[Forensic Engine Error]:", error);
    throw new Error("Forensic analysis failed. The engine encountered an unexpected state.");
  }
}
