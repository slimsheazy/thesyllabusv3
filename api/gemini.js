// Secure backend API for Gemini AI calls
// This serverless function keeps the API key secure on the backend

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { model, prompt, stream = false, image, systemInstruction, responseMimeType, responseSchema } = req.body;

    // Validate required fields
    if (!model || !prompt) {
      return res.status(400).json({ error: 'Model and prompt are required' });
    }

    // Get API key from environment variables (server-side only)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Build request body with JSON mode support
    const requestBody = {
      contents: [{
        parts: image 
          ? [{ text: prompt }, { inline_data: { mime_type: image.mime_type, data: image.data } }]
          : [{ text: prompt }]
      }]
    };

    // Add system instruction if provided
    if (systemInstruction) {
      requestBody.systemInstruction = systemInstruction;
    }

    // Add JSON mode configuration if provided
    if (responseMimeType === 'application/json' && responseSchema) {
      requestBody.generationConfig = {
        responseMimeType: responseMimeType,
        responseSchema: responseSchema
      };
    }

    // Make request to Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
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
      // Handle response - return either structured JSON or plain text
      const candidate = data.candidates?.[0];
      
      if (candidate?.content?.parts?.[0]?.text) {
        const text = candidate.content.parts[0].text;
        
        // Try to parse as JSON first (for structured responses)
        try {
          const parsedJson = JSON.parse(text);
          res.status(200).json({ response: parsedJson, text });
        } catch (parseError) {
          // If not valid JSON, return as plain text
          res.status(200).json({ text });
        }
      } else {
        res.status(200).json({ text: '' });
      }
    }

  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
