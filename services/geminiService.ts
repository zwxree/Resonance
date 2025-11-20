
import { GoogleGenAI, Chat, Modality } from "@google/genai";

const getGenAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- CHATBOT ---
let chat: Chat | null = null;

interface ChatLocation {
  lat: number;
  lng: number;
}

interface ChatResponse {
  text: string;
  groundingMetadata?: any;
}

export const startChat = (location?: ChatLocation) => {
  const ai = getGenAI();
  const tools: any[] = [{ googleSearch: {} }, { googleMaps: {} }];
  let toolConfig: any = undefined;

  if (location) {
      toolConfig = {
          retrievalConfig: {
              latLng: {
                  latitude: location.lat,
                  longitude: location.lng
              }
          }
      };
  }

  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "You are Aetherkraft AI. Concise, helpful, premium tone. Use Google Maps for location queries.",
      tools,
      toolConfig
    }
  });
};

export const sendMessageToChat = async (message: string, location?: ChatLocation): Promise<ChatResponse> => {
  if (!chat) {
    startChat(location);
  }
  try {
    const result = await chat!.sendMessage({ message });
    return {
        text: result.text || "",
        groundingMetadata: result.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return { text: "Connection disrupted. Please try again." };
  }
};

// --- SERVICE CENTRE SEARCH ---
export const findServiceCentres = async (): Promise<string> => {
    try {
        const ai = getGenAI();
        // Retrieve user location if possible, else default to general query
        let lat = 37.7749;
        let lng = -122.4194;
        
        if (navigator.geolocation) {
             await new Promise<void>((resolve) => {
                navigator.geolocation.getCurrentPosition((pos) => {
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                    resolve();
                }, () => resolve());
             });
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Find the nearest 3 electronics repair or energy service centers near me. List them with address and rating.",
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: { latitude: lat, longitude: lng }
                    }
                }
            }
        });
        return response.text || "No centers found nearby.";
    } catch (error) {
        console.error("Maps error", error);
        return "Unable to search maps at this moment.";
    }
}


// --- FAST RESPONSE (Flash Lite) ---
export const getQuickEnergyTip = async (): Promise<string> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: "gemini-flash-lite-latest",
            contents: "One very short, clever energy saving tip.",
        });
        return response.text || "Turn off the lights!";
    } catch (error) {
        return "Save energy, save money.";
    }
}

// --- THINKING MODE ---
export const analyzeWithThinkingMode = async (prompt: string): Promise<string> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        return response.text || "";
    } catch (error) {
        return "Analysis failed.";
    }
};

// --- IMAGE EDITING ---
export const editImageWithNanoBanana = async (prompt: string, base64ImageData: string, mimeType: string): Promise<string | null> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64ImageData, mimeType: mimeType } },
                    { text: prompt },
                ],
            },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData) return part.inlineData.data;
            }
        }
        return null;
    } catch (error) {
        console.error("Error editing image:", error);
        return null;
    }
};
