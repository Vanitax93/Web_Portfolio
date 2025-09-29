// This file runs on the Netlify Serverless Node.js environment.

// The native Node.js 'fetch' is used here, which is available in the Netlify runtime.
const HF_ACCESS_TOKEN = process.env.HUGGINGFACE_TOKEN;
const MODEL_NAME = "deepseek-ai/DeepSeek-V3-0324";

// --- System Instruction for the LLM ---
const PERSONAL_PROFILE = `
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
`;


/**
 * The main handler for the Netlify Serverless Function.
 * @param {object} event - The Netlify event object containing request details.
 * @returns {object} The response object with statusCode and body.
 */
exports.handler = async (event) => {

    // 1. Check HTTP Method
    if (event.httpMethod !== 'POST') {
        // This is the correct response for the browser GET request.
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed. Only POST requests are accepted.' }),
        };
    }

    // Check Environment Variable early, before any heavy lifting
    if (!HF_ACCESS_TOKEN) {
        console.error('HUGGINGFACE_TOKEN is not set.');
        return {
            statusCode: 500,
            body: JSON.stringify({ response: 'Server error: Hugging Face Access Token not configured on the server.' }),
        };
    }

    let query;
    try {
        // 2. Parse the request body (the JSON payload from the client)
        const body = JSON.parse(event.body);
        query = body.query;

        if (!query) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing query parameter in request body.' }),
            };
        }

    } catch (error) {
        console.error('Request Body Parsing Error:', error, 'Received body:', event.body);
        return {
            statusCode: 400,
            body: JSON.stringify({ response: `Invalid request format. Body could not be parsed as JSON. Debug: ${error.message}` }),
        };
    }


    try {
        // --- 3. Call Hugging Face API ---
        const hfResponse = await fetch(`https://api-inference.huggingface.co/models/${MODEL_NAME}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HF_ACCESS_TOKEN}`,
            },
            // Using the recommended Chat Completion structure for DeepSeek-V3
            body: JSON.stringify({
                messages: [
                    { "role": "system", "content": PERSONAL_PROFILE },
                    { "role": "user", "content": query }
                ],
                temperature: 0.7,
                max_new_tokens: 500,
            }),
        });

        // 4. Handle non-200 responses from the Upstream API (Hugging Face)
        if (!hfResponse.ok) {
            const status = hfResponse.status;
            let errorText = await hfResponse.text();

            // Log the raw error text for debugging, which likely contains "Not Found"
            console.error(`Hugging Face API returned status ${status}. Raw response: ${errorText}`);

            // Truncate message for client to prevent revealing sensitive info
            if (errorText.length > 200) errorText = errorText.substring(0, 200) + '...';

            let message = `Upstream API Error (${status}). This usually means the model is unavailable or the token is invalid.`;
            if (status === 404) {
                 message = `Upstream API Error: The model '${MODEL_NAME}' was not found. Please check the model name or your token scope.`;
            } else if (status === 401) {
                message = `Upstream API Error: Unauthorized. Please check if your HUGGINGFACE_TOKEN is set correctly and is active.`;
            }

            return {
                statusCode: 502, // Bad Gateway (Upstream service error)
                body: JSON.stringify({ response: message }),
            };
        }

        // 5. If response is OK, try to parse JSON
        // This is safe now because we've checked hfResponse.ok
        const data = await hfResponse.json();

        // 6. Check for specific Hugging Face JSON error structure (if the API returns 200 but contains an error object)
        if (data.error) {
             console.error('Hugging Face API Error (JSON):', data);
             return {
                statusCode: 502,
                body: JSON.stringify({ response: `Upstream API Error: ${data.error}` }),
            };
        }


        // 7. Extract and Return Successful Response
        const botMessage = data.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ response: botMessage }),
        };

    } catch (error) {
        console.error('Serverless Function Execution Error (Hugging Face Fetch):', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ response: `An unexpected internal server error occurred: ${error.message}` }),
        };
    }
};
