// api/generar-texto.js
// Esta función vive en el servidor de Vercel (no en el navegador), por eso la clave
// de la IA nunca queda visible para quien use la página.

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método no permitido" });
    }

    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const { prompt, maxTokens } = body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Falta el contenido a generar." });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Falta configurar ANTHROPIC_API_KEY en Vercel (Settings → Environment Variables)." });
    }

    const respuesta = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: maxTokens || 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      return res.status(respuesta.status).json({ error: datos?.error?.message || "La IA devolvió un error." });
    }

    const texto = (datos.content || []).map(bloque => bloque.text || "").join("\n").trim();
    return res.status(200).json({ texto });
  } catch (err) {
    return res.status(500).json({ error: "Error interno del servidor: " + (err && err.message ? err.message : "desconocido") });
  }
}
