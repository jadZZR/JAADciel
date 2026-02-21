export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // On récupère l'HISTORIQUE complet de la conversation
  const { history } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Clé API non trouvée sur Vercel." });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Les instructions secrètes de l'IA (Son comportement de commercial)
  const systemPrompt = `Tu es JAAD AI, le conseiller expert et chaleureux de l'agence créative JAAD Studio (spécialisée en Web Design, Studio 3D, IA et E-learning).
  
  TON OBJECTIF : Conseiller le client sur son projet et récupérer ses coordonnées pour qu'un humain prenne le relais.
  
  RÈGLES DE CONDUITE :
  1. Pose tes questions UNE PAR UNE. Ne demande pas toutes les infos d'un coup.
  2. Sois concis, professionnel et naturel.
  3. Tu dois obligatoirement récolter : Le besoin (Web, 3D, IA...), le Nom complet, l'Email et le Numéro de téléphone.
  
  RÈGLE FINALE DÉCLENCHEUSE (TRÈS IMPORTANT) :
  QUAND ET SEULEMENT QUAND tu as récolté le nom, l'email, le téléphone et le résumé du besoin, tu dois remercier le client et terminer ton message EXACTEMENT par ce bloc de données (remplace avec les vraies infos du client). Ne mets aucun texte après ce bloc :
  
  <CONTACT_DATA>
  {"name": "nom du client", "email": "email du client", "phone": "téléphone du client", "service": "service identifié", "message": "résumé du projet"}
  </CONTACT_DATA>`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: history // L'IA lit toute la conversation pour se souvenir des réponses
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Erreur Google" });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Désolé, je n'ai pas compris.";
    res.status(200).json({ text: aiText });

  } catch (error) {
    res.status(500).json({ error: "Erreur serveur : " + error.message });
  }
}
