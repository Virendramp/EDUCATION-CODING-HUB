require('dotenv').config();
console.log("Testing API Key connection...");
const apiKey = process.env.API_KEY;

async function testApi() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        models: ["google/gemma-3-27b-it:free", "meta-llama/llama-3.3-70b-instruct:free", "openrouter/free"],
        max_tokens: 1500,
        messages: [{
          role: "system",
          content: "You are a helpful educational coding assistant. Answer the user's question with excellent quality and practical examples. Keep the answer medium length (around 200-400 words). Do not use large headings like `#`, just bolding."
        }, {
          role: "user",
          content: "Explain JVM in Java in 2 sentences."
        }]
      })
    });
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
    if (data.choices && data.choices[0]) {
      console.log("\nGenerated Answer:", data.choices[0].message.content);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

testApi();
