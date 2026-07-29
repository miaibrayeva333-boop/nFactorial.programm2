const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-3.5-flash';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>;
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Use a POST request.' }, 405);

  try {
    if (!GEMINI_API_KEY) {
      return json({ error: 'AI is not configured yet.' }, 503);
    }

    const body = (await req.json()) as {
      prompt?: unknown;
      system?: unknown;
      image?: unknown;
      imageMimeType?: unknown;
    };
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const system = typeof body.system === 'string' ? body.system.trim() : '';
    const image = typeof body.image === 'string' ? body.image : '';
    const imageMimeType = typeof body.imageMimeType === 'string' ? body.imageMimeType : '';

    if (!prompt) return json({ error: 'Write a prompt for AI.' }, 400);
    if (prompt.length > 10_000 || system.length > 5_000) {
      return json({ error: 'The request is too long.' }, 400);
    }
    if (image && (!imageMimeType.startsWith('image/') || image.length > 12_000_000)) {
      return json({ error: 'The image is too large or has an unsupported format.' }, 400);
    }

    const parts: Array<Record<string, unknown>> = [{ text: prompt }];
    if (image) parts.unshift({ inline_data: { mime_type: imageMimeType, data: image } });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          contents: [{ parts }],
        }),
      },
    );

    const data = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      console.error('Gemini request failed', response.status, data);
      return json({ error: 'AI could not respond. Please try again shortly.' }, 502);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' || !text.trim()) {
      return json({ error: 'AI returned an empty response.' }, 502);
    }
    return json({ text });
  } catch (error) {
    console.error('AI function failed', error);
    return json({ error: 'Could not reach AI. Please try again.' }, 500);
  }
});
