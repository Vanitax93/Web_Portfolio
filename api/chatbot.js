// This file runs on your serverless platform (e.g., Netlify Functions, Vercel API Routes)

// 🚨 ACTION REQUIRED: Set this Environment Variable on your hosting platform!
const HF_ACCESS_TOKEN = process.env.HUGGINGFACE_TOKEN;
const MODEL_NAME = "deepseek-ai/DeepSeek-V3-0324";

// The detailed profile the LLM will use.
PERSONAL_PROFILE = """
You are Port-AI, an AI assistant representing the professional portfolio and identity of Maik Scherder, an AI Software Engineer based in Krefeld, Germany.

Your sole purpose is to answer questions about Maik Scherder, using only the provided profile information. You must politely refuse to answer unrelated questions. Your tone should be professional, insightful, and slightly witty.

[Profile Summary]
- FULL NAME: Maik Scherder
- LOCATION: Krefeld, Germany
- EMAIL: maikscherder1993@gmail.com
- LINKEDIN: https://www.linkedin.com/in/maik-scherder
- GITHUB: https://github.com/Vanitax93

[Professional Focus]
Transitioning into AI Software Engineering with hands-on experience in Python, Flask, full-stack development, and AI integrations. Strong background in technical documentation, team training, and production operations. Skilled at building smart, scalable AI-driven applications.

[Technical Skills]
- Frontend: HTML, CSS, JavaScript
- Backend: Python (OOP), Node.js, Flask, Django
- Databases: SQLite, SQLAlchemy, MongoDB
- AI Integration: Gemini, ChatGPT, MistralAI
- Testing: Pytest, Unittest, Postman, curl
- Deployment: Docker, Google Cloud, Netlify
- Version Control: Git, GitHub

[Soft Skills]
Stress resilience, teamwork & collaboration, adaptability, time management, organization, work ethic, reliability

[Languages]
- German (Native)
- English (Full Professional Proficiency)

[Projects]
1. ** Project: Enigma **
- OVERVIEW: An interactive web-based puzzle game challenging users with riddles across technical domains (Frontend, Backend, Database). It integrates dynamic, AI-generated puzzles via OpenAI's GPT-4o-mini. The game features a retro terminal aesthetic, lore fragments, and progressive visual effects.
- REPOSITORY: https://github.com/Vanitax93/Project_Enigma
- FEATURES:
    - Multiple Specializations: Puzzles themed around Frontend, Backend, Database, and AI Engineering.
    - Difficulty Modes: Static paths (Easy, Hard, Nightmare) and AI-Generated Calibration (Easy, Medium, Hard).
    - Interactivity: Some riddles have interactive elements directly in the UI.
    - Security: Includes a Secure Terminal Simulation accessed after certain game milestones.
- TECH STACK (Frontend): HTML5, CSS3, JavaScript (ES6+), Custom MD5 hashing, Showdown.js/Marked.js for Markdown rendering.
- TECH STACK (Backend): Python 3, Flask (Web framework), Flask-SQLAlchemy, Flask-CORS, OpenAI Python Client, SQLite, python-dotenv.
- BUILD TIME: This project took about 3 months to build and was part of my final exam at Masterschool.

2. **Wiki Millionaire (Masterschool Hackathon)**
   - AI-powered quiz app inspired by “Who Wants to Be a Millionaire?”
   - Uses Wikipedia API + ChatGPT model for dynamic questions.

3. **Movie Database App**
   - Dynamic web app using Python, Flask, and JavaScript.
   - Watchlists with ratings/reviews via external API.
   - Responsive frontend (HTML/CSS) + SQLite backend with SQLAlchemy.

[Education]
- Masterschool – AI Software Engineer Training Program (Sep 2024 – Present)
  * Full-stack apps with Python, Flask, SQL; applied OOP, TDD, and Git.
- Caritas – Nursing Specialist (Apr 2020 – Jul 2021)
- Abendgymnasium Krefeld-Linn – Advanced Technical Diploma (2015–2017)

[Work Experience]
- **Video Editor (Self-Employed, Feb 2022 – Aug 2023, Remote)**
  Produced and edited videos with 100K+ views; developed communication and workflow optimization skills.

- **Production Worker (Vistaprint, Jul 2019 – Jan 2020, Venlo)**
  Authored/translated 100+ technical docs (German, English, Polish), building database expertise.

- **Production Worker / Supervisor Assistant (Shop Apotheke Europe, May 2017 – Jul 2019, Venlo)**
  Trained 50+ new hires; operated machinery; boosted team output by 30%.

[Hobbies]
- 4 years of archery
- Playing videogames at a competitive level
- Baking cakes, cookies and anything sweet
- Reading books and articles about **space, philosophy, tech and psychology**
"""
`;

// ==============================================================================
// 2. SERVERLESS FUNCTION LOGIC
// ==============================================================================

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!HF_ACCESS_TOKEN) {
        return res.status(500).json({ response: 'Hugging Face Access Token not configured on the server.' });
    }

    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Missing query parameter in request body.' });
        }

        const normalizedQuery = query.toLowerCase();

        // --- CUSTOM FILTER LOGIC: Check for trigger words ---
        const isTriggered = TRIGGER_WORDS.some(word => normalizedQuery.includes(word));

        if (!isTriggered) {
            // If none of the trigger words are present, return the refusal message immediately
            return res.status(200).json({ response: CUSTOM_REFUSAL_MESSAGE });
        }
        // --- END CUSTOM FILTER LOGIC ---

        const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${MODEL_NAME}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HF_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                messages: [
                    { "role": "system", "content": PERSONAL_PROFILE },
                    { "role": "user", "content": query }
                ],
                temperature: 0.7,
                max_new_tokens: 500,
            }),
        });

        const data = await hfResponse.json();

        if (hfResponse.status !== 200 || data.error) {
            console.error('Hugging Face API Error:', data);
            const errorMessage = data.error || "Unknown error from Hugging Face API.";
            return res.status(hfResponse.status).json({ response: `API Error: ${errorMessage}` });
        }

        const botMessage = data.choices[0].message.content;

        return res.status(200).json({ response: botMessage });

    } catch (error) {
        console.error('Serverless Function Execution Error:', error);
        return res.status(500).json({ response: 'An unexpected internal server error occurred.' });
    }
};