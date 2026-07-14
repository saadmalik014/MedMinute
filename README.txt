MEDMINUTE 2.0

Open index.html to preview.

New architecture:
- Learn hub
- Expandable Health Library
- Educational Symptom Explorer
- Interactive Anatomy
- Clinical & Nursing Skills Library
- Meet the Founder
- Student Opportunities (in development)

Preserved:
- Biology 20 study notes, flashcards and practice questions
- Chemistry 30 study notes, flashcards and diploma preparation
- Medical Dictionary
- Medical Case Challenges
- Detailed Specialty Guides
- Videos and contact pages

Educational content only; not medical advice.


MEDMINUTE 3.1 AI EDITION — SETUP

The website itself can still be opened as static HTML, but real MedMinute AI answers require
the included secure Node.js server.

1. Install Node.js 20 or newer.
2. Open a terminal inside this folder.
3. Run:
       npm install
4. Copy .env.example to .env, then enter:
       OPENAI_API_KEY=your_private_api_key
       OPENAI_MODEL=a_model_available_in_your_OpenAI_project
5. Load the environment variables and start the server.

macOS/Linux example:
       export OPENAI_API_KEY="your_private_api_key"
       export OPENAI_MODEL="your_model_name"
       npm start

Windows PowerShell example:
       $env:OPENAI_API_KEY="your_private_api_key"
       $env:OPENAI_MODEL="your_model_name"
       npm start

6. Open:
       http://localhost:3000/ai-assistant.html

DEPLOYMENT
Deploy the full folder to a Node-compatible service and set OPENAI_API_KEY and OPENAI_MODEL
as private server environment variables. Never place the API key inside HTML or browser JavaScript.

HOW IT WORKS
- The server searches assets/medminute-corpus.json for relevant website passages.
- Only those passages are supplied to the AI.
- The answer is returned with links to the relevant MedMinute pages.
- Medical safety instructions prevent diagnosis and treatment advice.

Open index.html directly only previews the website. The real AI endpoint requires npm start.


MEDMINUTE 3.2 AI TUTOR — ACTIVATION

The visual website can be previewed by opening index.html, but the real AI and AI Tutor require
the secure Node.js server.

LOCAL SETUP
1. Install Node.js 20 or newer.
2. Unzip this folder and open Terminal/PowerShell inside it.
3. Run:
       npm install
4. Set your private OpenAI environment variables.

macOS/Linux:
       export OPENAI_API_KEY="your_private_api_key"
       export OPENAI_MODEL="a_model_available_in_your_API_project"
       npm start

Windows PowerShell:
       $env:OPENAI_API_KEY="your_private_api_key"
       $env:OPENAI_MODEL="a_model_available_in_your_API_project"
       npm start

5. Open:
       http://localhost:3000/ai-tutor.html

NEVER place the API key in HTML, assets/script.js or any public browser file.

AI TUTOR FEATURES
- Teach mode: structured explanation grounded in MedMinute
- Quiz mode: original six-question scored quizzes
- Flashcards: ten generated cards
- Test Me: one question at a time with answer evaluation
- Alberta Practice: Biology 20 and Chemistry 30 teaching/practice
- Next Lesson: recommendations based on locally stored mastery
- Session memory: recent conversation is sent during the current page session
- Mastery tracking: quiz and tutor scores are saved in the browser

DEPLOYMENT
Use Node-compatible hosting. Upload the complete project and set OPENAI_API_KEY and
OPENAI_MODEL as private environment variables in the host settings.


MEDMINUTE 4.0 PREMIUM
- Detailed layered 3D-style anatomy explorer with organs, skeleton and muscles
- Smooth page transitions, breadcrumbs and keyboard shortcuts
- Continue-learning homepage card
- Estimated reading times and last-updated labels
- Print-friendly articles and certificates
- Browser voice playback for AI Tutor and medical articles
- Secure AI Medical Image Explainer for de-identified educational images
- Completion certificate system with SVG download and Print/Save PDF
- Skeleton loading and polished empty states


MEDMINUTE 4.1 LIVE IMPACT
- Anonymous server-backed visitor and engagement analytics
- Public dashboard with total visitors, active learners, reads, AI use and certificates
- Automatic 15-second dashboard refresh
- More realistic full-body male anatomy replica with face, hands, feet and natural contours
- Company-grade homepage, announcement bar and verified-impact section
- Analytics event deduplication and generated-quiz tracking fixes


MEDMINUTE 4.2 CHALLENGE & ANATOMY
- Replaces the checklist challenge with thirty required interactive learning activities
- Six themed chapters with locked progression, lives, XP, ratings and chapter badges
- Matching, sequencing, multiple-select, clinical decision and checkpoint tasks
- Day 30 final virtual-patient stroke pathway
- Reflections and confidence ratings saved locally
- Full compatibility with the existing 30-Day Challenge certificate
- More realistic exterior human figure plus detailed skull, rib cage, spine, pelvis, limb bones and muscle groups
- Exterior, organ, skeleton and muscle viewing modes


MEDMINUTE 4.3 PROFESSIONAL ANATOMY
- Complete Anatomy Explorer interface redesign without using copied or generated artwork
- Custom detailed layered SVG model preserved inside a professional atlas layout
- System isolation for skeletal, muscular, circulatory, nervous, respiratory, digestive, endocrine and urinary systems
- Searchable structures, region focus cards, zoom, rotation and reset controls
- Dynamic right-side panel with functions, tests, conditions and related MedMinute learning
- Guided tour and automatic anatomy progress tracking
- Direct handoff from a selected structure to the AI Tutor


EASY AI SETUP
Mac:
1. Double-click SETUP_MEDMINUTE_AI.command.
2. Paste your own private OpenAI API key when asked.
3. The script installs dependencies, creates .env, starts the server and opens the AI Tutor.
4. For later sessions, double-click RUN_MEDMINUTE.command.

Windows:
1. Double-click SETUP_MEDMINUTE_AI_WINDOWS.bat.
2. Paste your private API key.
3. For later sessions, use RUN_MEDMINUTE_WINDOWS.bat.

The API key cannot be created or supplied by MedMinute. Never share it.
