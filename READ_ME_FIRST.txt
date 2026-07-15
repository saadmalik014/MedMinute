MEDMINUTE CLEAN AI FIX

WHY THE OLD DEPLOYMENT BROKE THE WEBSITE
Vercel detected server.mjs as a full Express application. That changed how the whole website was served. Vercel ignores express.static() for Express deployments, so the CSS/assets stopped being served normally.

THIS FIX KEEPS THE WEBSITE STATIC AND ADDS ONLY API FUNCTIONS.

DO THIS IN YOUR LOCAL GITHUB MEDMINUTE FOLDER
1. DELETE server.mjs from the repository folder.
2. DELETE the old api folder.
3. DELETE package-lock.json if it exists.
4. Copy this patch's api folder into the repository root.
5. Replace package.json with this patch's package.json.
6. Replace vercel.json with this patch's vercel.json.
7. Do NOT copy or upload any .env file.
8. In GitHub Desktop, commit: Clean standalone AI API
9. Push origin.

IMPORTANT
- Do not promote the new deployment immediately.
- Open its Preview URL first.
- Test /api/health and /ai-tutor.html on the Preview URL.
- Only promote after the preview website styling and AI both work.

Vercel must contain OPENAI_API_KEY for Preview and Production.
OPENAI_MODEL is optional; this code defaults to gpt-5-mini.

The API key shown previously in a screenshot must be revoked and replaced.
