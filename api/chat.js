export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GROQ_API_KEY in Vercel environment variables"
      });
    }

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: "You are Nova AI, a helpful, sharp, futuristic AI assistant. Keep answers clear, useful, and nicely formatted."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(groqRes.status).json({
        error: data?.error?.message || "Groq API request failed"
      });
    }

    const reply = data?.choices?.[0]?.message?.content || "No response from model.";
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Internal server error"
    });
  }
}
