// Secure backend API for Gemini AI calls
// This serverless function keeps the API key secure on the backend

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, prompt, stream = false, image } = req.body;

    // Validate required fields
    if (!model || !prompt) {
      return res.status(400).json({ error: 'Model and prompt are required' });
    }

    // Get API key from environment variables (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Make request to Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const requestBody = {
      contents: [{
        parts: image 
          ? [{ text: prompt }, { inline_data: { mime_type: image.mime_type, data: image.data } }]
          : [{ text: prompt }]
      }]
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.error?.message || 'Gemini API error' });
    }

    const data = await response.json();
    
    if (stream) {
      // Handle streaming response
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // For now, return non-streaming response
      // TODO: Implement proper streaming if needed
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
      res.end();
    } else {
      // Handle non-streaming response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      res.status(200).json({ text });
    }

  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
