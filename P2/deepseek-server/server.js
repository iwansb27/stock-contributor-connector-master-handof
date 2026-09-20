import express from "express";
import multer from "multer";

const app = express();
const upload = multer({ limits: { fileSize: 32 * 1024 * 1024 } });
const port = process.env.PORT || 8787;
const apiKey = process.env.DEEPSEEK_API_KEY;

app.get("/health", (_req, res) => res.json({ ok: true, provider: "deepseek", model: "deepseek-flash" }));

app.post("/api/analyze", upload.single("image"), async (req, res) => {
  if (!apiKey) return res.status(503).json({ error: "DEEPSEEK_API_KEY is not configured on the server." });
  if (!req.file) return res.status(400).json({ error: "image is required" });

  const mime = req.file.mimetype;
  if (!["image/jpeg","image/png","image/gif","image/webp"].includes(mime)) {
    return res.status(400).json({ error: "Supported image formats: JPEG, PNG, GIF, WebP." });
  }

  const base64 = req.file.buffer.toString("base64");
  const prompt = `Analyze this stock-contributor image and return JSON only.
Required JSON:
{
  "title": "concise commercial stock title",
  "description": "accurate neutral description",
  "keywords": ["relevant", "specific", "non-redundant", "keywords"],
  "category_suggestion": "suggested Shutterstock category",
  "visible_text": [],
  "brand_or_logo_detected": false,
  "people_or_property_release_attention": false
}
Rules: describe only what is visibly supported; do not invent brands, locations, people, actions, or facts. Keywords should be useful for stock search and avoid duplicates. This is a metadata suggestion, not a Shutterstock submission decision.`;

  try {
    const r = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-flash",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:${mime};base64,${base64}`, detail: "original" } }
          ]
        }],
        response_format: { type: "json_object" },
        max_tokens: 4096
      })
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data?.error?.message || "DeepSeek request failed." });

    const content = data?.choices?.[0]?.message?.content;
    if (!content) return res.status(502).json({ error: "DeepSeek returned no JSON content." });

    let metadata;
    try { metadata = JSON.parse(content); }
    catch { return res.status(502).json({ error: "DeepSeek returned invalid JSON." }); }

    res.json({ provider: "DeepSeek", model: "deepseek-flash", metadata });
  } catch (err) {
    res.status(502).json({ error: err?.message || "DeepSeek connection failed." });
  }
});

app.listen(port, () => console.log(`DeepSeek API server listening on :${port}`));
