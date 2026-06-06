import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function generateSermonInsights(transcript: string) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: `Analyze the following sermon transcript and provide:
1. A concise summary in English.
2. A concise summary in Kiswahili.
3. A 3-day devotional based on the sermon (Day 1, Day 2, Day 3).
4. 5 small group discussion questions.

Transcript:
${transcript}` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summaryEn: { type: Type.STRING },
          summarySw: { type: Type.STRING },
          devotional: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
              },
            },
          },
          discussionQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ["summaryEn", "summarySw", "devotional", "discussionQuestions"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generatePersonalDevotional(sermonTitle: string, summary: string, userContext: string) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: `Based on the sermon "${sermonTitle}" with the following summary: "${summary}", 
    generate a personalized 7-day devotional for a member who shared this context: "${userContext}".
    
    The devotional should include for each day:
    1. A title.
    2. A scripture verse.
    3. A personal reflection tailored to their context.
    4. A prayer point.` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                title: { type: Type.STRING },
                scripture: { type: Type.STRING },
                reflection: { type: Type.STRING },
                prayer: { type: Type.STRING },
              },
              required: ["day", "title", "scripture", "reflection", "prayer"],
            },
          },
        },
        required: ["days"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateSocialContent(topic: string, platform: string) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: `Generate an engaging social media post for ${platform} about the following topic: "${topic}".
    The post should be warm, inviting, and include relevant hashtags and emojis.
    For Facebook: Include a call to action to join the service.
    For YouTube: Create a compelling community post or video description.
    For Web App: Create a concise announcement.` }] }],
    config: {
      temperature: 0.8,
    },
  });

  return response.text;
}

export async function generateStory(topic: string) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: `Create an engaging and biblically accurate story about: "${topic}".
    The story should be inspiring, warm, and encourage faith.` }] }],
    config: {
      temperature: 0.7,
    },
  });

  return response.text;
}

export async function generatePrayerMatch(prayerRequest: string, availablePrayers: { id: string, content: string }[]) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: `Given the prayer request: "${prayerRequest}", 
    find the most relevant prayer requests from this list to create a "Prayer Circle":
    ${JSON.stringify(availablePrayers)}
    
    Return the IDs of the top 2-3 matching prayers and a brief explanation of why they are connected (e.g., "Both are seeking peace in family").` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchedIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          connectionReason: { type: Type.STRING }
        },
        required: ["matchedIds", "connectionReason"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateGroupRecommendation(userInterests: string, availableGroups: { name: string, description: string }[]) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: `Based on the user's interests: "${userInterests}", 
    recommend the best church groups from this list:
    ${JSON.stringify(availableGroups)}
    
    Return the top 2 recommended group names and a brief explanation of why they are a good fit.` }] }],
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
                groupName: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["groupName", "reason"]
            }
          }
        },
        required: ["recommendations"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateChildrenStory(topic: string) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: `Create a short, engaging Bible story for children about: "${topic}".
    The story should be simple, fun, and include:
    1. A clear moral lesson.
    2. A simple memory verse.
    3. 3 fun questions to ask the child.` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          story: { type: Type.STRING },
          moral: { type: Type.STRING },
          memoryVerse: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "story", "moral", "memoryVerse", "questions"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function chatWithBibleAI(message: string, history: any[]) {
  const chat = ai.chats.create({
    model: "gemini-3.5-flash",
    config: {
      systemInstruction: "You are a helpful and wise Bible AI Assistant for PCEA Elijah Kagiri Memorial Church. Your goal is to provide biblical guidance, answer theological questions, and encourage the congregation. Be respectful, compassionate, and grounded in scripture.",
    },
  });

  // Convert history to Gemini format if needed, but for simplicity we'll just send the message
  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function generateStudyPlan(topic: string, duration: number) {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [{ role: "user", parts: [{ text: `Create a personalized ${duration}-day Bible study plan for the topic: "${topic}".
Provide a title, a brief description, and a day-by-day breakdown with:
1. A main scripture passage.
2. A key verse.
3. A short reflection.
4. A practical application.

The output must be in JSON format.` }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                scripture: { type: Type.STRING },
                keyVerse: { type: Type.STRING },
                reflection: { type: Type.STRING },
                application: { type: Type.STRING },
              },
              required: ["day", "scripture", "keyVerse", "reflection", "application"],
            },
          },
        },
        required: ["title", "description", "days"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
