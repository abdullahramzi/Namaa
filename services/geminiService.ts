import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, Language, Service, Course, RecommendationItem } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateBusinessInsights = async (
  idea: string,
  language: Language
): Promise<AIResponse | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  const prompt = `
    You are a business consultant expert.
    User Business Idea: "${idea}"
    Language: ${language === 'ar' ? 'Arabic' : 'English'}
    
    Provide:
    1. A creative business name.
    2. A catchy slogan.
    3. Three actionable short steps for initial growth strategy.
    
    Return pure JSON with keys: "businessName", "slogan", "strategySteps" (array of strings).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            businessName: { type: Type.STRING },
            slogan: { type: Type.STRING },
            strategySteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};

export const getRecommendations = async (
  userGoal: string,
  services: Service[],
  courses: Course[],
  language: Language
): Promise<RecommendationItem[] | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  // Prepare catalog summary for context
  const servicesList = services.map(s => `ID: ${s.id}, Name: ${s.titleEn}, Desc: ${s.descriptionEn}`).join('\n');
  const coursesList = courses.map(c => `ID: ${c.id}, Name: ${c.titleEn}, Desc: ${c.descriptionEn}`).join('\n');

  const prompt = `
    You are an intelligent recommendation engine for a business services platform.
    
    User Goal/Context: "${userGoal}"
    Language: ${language === 'ar' ? 'Arabic' : 'English'}

    Available Services:
    ${servicesList}

    Available Courses:
    ${coursesList}

    Task: Recommend exactly 3 items (mix of services and courses is allowed) that best help the user achieve their goal.
    
    Return pure JSON with key "recommendations" which is an array of objects.
    Each object must have:
    - "itemId": The ID of the service or course.
    - "type": "service" or "course".
    - "reason": A short explanation (in ${language === 'ar' ? 'Arabic' : 'English'}) of why this is recommended.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  itemId: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["service", "course"] },
                  reason: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;

    const result = JSON.parse(text);
    return result.recommendations as RecommendationItem[];
  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return null;
  }
};