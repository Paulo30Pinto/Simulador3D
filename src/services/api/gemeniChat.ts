import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBuay8FG_4vqOgVpwzm9KhP4U5B07Llyk4" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemma-3-27b-it",
    contents: "Explain how AI works in a few words",
  });
  console.log(response.text);
}

main();