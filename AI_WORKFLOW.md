# AI-Assisted Engineering Workflow

## Tools Used
- **Antigravity (Autonomous Coding Agent)**: Used as the primary autonomous developer to scaffold, brainstorm, and write the full-stack code.
- **Google Gemini API (gemini-2.5-flash)**: Used as the core Vision OCR engine within the application to digitize the handwritten operational documents.

## How AI Was Used During Development
1. **Brainstorming & Architecture Planning**: The AI agent drafted an implementation plan with UML sequence/class diagrams (Mermaid) to visualize the data flow before coding.
2. **Scaffolding**: The agent used Next.js CLI to bootstrap the project and installed necessary dependencies natively.
3. **Full-Stack Implementation**: The agent wrote the SQLite DB schema, API routes, and React components simultaneously, ensuring the validation rules and confidence scoring logic connected perfectly.
4. **Prompt Engineering for OCR**: The agent crafted a precise zero-shot prompt for Gemini 2.5 Flash, instructing it to return a structured JSON array and self-evaluate its confidence for each field.

## Areas Where AI Helped Most
- **Rapid Prototyping**: Setting up the full-stack architecture (Next.js App Router + SQLite) and writing all the CRUD API routes in a matter of minutes.
- **UI/UX Generation**: Generating a complete "Glassmorphism" dark mode CSS theme with custom variables, and scaffolding the split-screen review interface without needing manual CSS tinkering.

## Areas Requiring Manual Intervention
- **Environment Setup**: The user must manually provide the `GEMINI_API_KEY` in their shell or `.env.local` file to authenticate the Vision OCR model.
- **Deployment**: The user will handle deploying this prototype to a free-tier hosting platform (like Vercel) and uploading the demo video as required by the assignment.
