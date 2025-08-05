"use server";

import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateBedtimeStory() {
  try {
    const { text } = await generateText({
      model: openai("gpt-4o"), // Using gpt-4o as gpt-4.1 is not a standard model name
      prompt: "Write a one-sentence bedtime story about a unicorn.",
    });
    console.log(text);
    return { success: true, story: text };
  } catch (error) {
    console.error("Error generating bedtime story:", error);
    return {
      success: false,
      error:
        "Failed to generate story. Please check your API key and try again.",
    };
  }
}
