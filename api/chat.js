/**
 * Cette fonction s'exécute uniquement sur les serveurs de Vercel.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "La clé API n'est pas configurée sur Vercel." });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: `Tu es JAAD AI, l'assistant expert de l'agence JAAD Studio (Web Design, 3D, IA, E-learning). Sois pro, créatif et concis. Client : ${message}` }] 
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Erreur API Google' });
    }

    const aiText = data.candidates[0].content.parts[0].text;
    res.status(200).json({ text: aiText });

  } catch (error) {
    res.status(500).json({ error: "Erreur de connexion au service IA." });
  }
}
