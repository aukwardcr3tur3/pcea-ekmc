import { pipeline } from '@xenova/transformers';

let generator: any = null;

async function getGenerator() {
  if (!generator) {
    // Using Phi-3-mini as a browser-compatible, free, open-source model
    // Note: Downloading this to the browser will take some time
    generator = await pipeline('text-generation', 'Xenova/phi-3-mini-4k-instruct');
  }
  return generator;
}

export async function generateText(prompt: string): Promise<string> {
  const gen = await getGenerator();
  const output = await gen(prompt, { max_new_tokens: 500 });
  // The output might include the prompt, so we should clean it up if necessary
  return output[0].generated_text;
}

// These are simplified wrappers since browser models cannot easily do 
// robust JSON schema enforcement like Gemini.
export async function generateSermonInsights(transcript: string) {
  const prompt = `Analyze this sermon and provide summary, devotional, and discussion questions. 
  Transcript: ${transcript}`;
  return await generateText(prompt);
}

export async function generatePersonalDevotional(sermonTitle: string, summary: string, userContext: string) {
    const prompt = `Based on sermon "${sermonTitle}" and summary: "${summary}", 
    generate a 7-day devotional for context: "${userContext}".`;
    return await generateText(prompt);
}

export async function generateSocialContent(topic: string, platform: string) {
    const prompt = `Generate a social media post for ${platform} about: "${topic}"`;
    return await generateText(prompt);
}

export async function generateStory(topic: string) {
    const prompt = `Create a biblically accurate story about: "${topic}"`;
    return await generateText(prompt);
}

export async function generatePrayerMatch(prayerRequest: string, availablePrayers: any[]) {
    const prompt = `Match prayer request "${prayerRequest}" with prayers: ${JSON.stringify(availablePrayers)}`;
    return await generateText(prompt);
}

export async function generateGroupRecommendation(userInterests: string, availableGroups: any[]) {
    const prompt = `Recommend groups based on interests "${userInterests}" from ${JSON.stringify(availableGroups)}`;
    return await generateText(prompt);
}

export async function generateChildrenStory(topic: string) {
    const prompt = `Create a Bible story for children about: "${topic}"`;
    return await generateText(prompt);
}

export async function chatWithBibleAI(message: string, history: any[]) {
    const prompt = `You are a helpful Bible assistant.
    Message: ${message}`;
    return await generateText(prompt);
}

export async function generateStudyPlan(topic: string, duration: number) {
    const prompt = `Create a ${duration}-day study plan for topic: "${topic}"`;
    return await generateText(prompt);
}
