
import { GoogleGenAI } from "@google/genai";
import { Restaurant } from "../types";

const API_KEY = process.env.API_KEY || "";

export const searchRestaurants = async (query: string, location?: GeolocationCoordinates): Promise<Restaurant[]> => {
  if (!API_KEY) {
    console.error("API Key is missing");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find restaurant details for: "${query}". Return the name, exact address, and Google Maps URL.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: location ? {
            latLng: {
              latitude: location.latitude,
              longitude: location.longitude
            }
          } : undefined
        }
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Transform grounding chunks into Restaurant objects
    const results: Restaurant[] = chunks
      .filter((chunk: any) => chunk.maps)
      .map((chunk: any) => ({
        id: chunk.maps.uri || Math.random().toString(36).substr(2, 9),
        name: chunk.maps.title || "Unknown Restaurant",
        address: "Google Maps Result",
        mapsUrl: chunk.maps.uri || "",
      }));

    // If no grounding chunks, fall back to parsing text or return empty
    if (results.length === 0 && response.text) {
        // Fallback placeholder logic if the tool didn't return direct chunks
        // This is a safety measure.
        return [];
    }

    return results;
  } catch (error) {
    console.error("Error searching restaurants:", error);
    return [];
  }
};
