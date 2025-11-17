
import { GoogleGenAI, Chat, Modality } from "@google/genai";

const getGenAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- CHATBOT ---
let chat: Chat | null = null;

export const startChat = () => {
  const ai = getGenAI();
  // Fix: Use systemInstruction for better model guidance and remove redundant history.
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: "You are a helpful assistant for Resonance Control, a premium energy management app. Answer questions concisely about the app's features and energy management."
    }
  });
};

export const sendMessageToChat = async (message: string): Promise<string> => {
  if (!chat) {
    startChat();
  }
  try {
    // Fix: The `sendMessage` method expects a string, not an object.
    const result = await chat!.sendMessage(message);
    return result.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
};

// --- IMAGE EDITING ---
export const editImageWithNanoBanana = async (prompt: string, imageBase64: string, mimeType: string): Promise<string | null> => {
  try {
    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return null;

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    return null;
  }
};

// --- THINKING MODE ---
export const analyzeWithThinkingMode = async (prompt: string): Promise<string> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error with Thinking Mode:", error);
        return "An error occurred while analyzing the data. Please try again.";
    }
};

// --- TTS ---
export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with a calm and clear voice: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};
