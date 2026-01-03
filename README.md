# StudioAI

Professional AI Video Production Studio built with Next.js 14, TypeScript, and Tailwind CSS.

## Features
- **Topic Studio**: Template-based video generation.
- **Visual DNA**: Text-based style cloning without copyright risks.
- **Batch Engine**: Mass production queue (10-50 jobs).
- **Model Agnostic**: Supports logical mapping for Runway, Veo, Sora, etc.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   Copy `.env.example` to `.env` and add your Google Gemini API Key (for analysis features).
   ```bash
   cp .env.example .env.local
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

## Deployment (Vercel)

1. Push to GitHub.
2. Import project into Vercel.
3. Add `GOOGLE_API_KEY` to Vercel Environment Variables.
4. Deploy.

## Architecture
- **State**: Zustand (Global studio state)
- **Styling**: Tailwind CSS
- **AI**: `@google/generative-ai` (Gemini 1.5 Flash) for text analysis.
- **Strict Mode**: Enabled.

## Packaging
Designed for future packaging with Antigravity into a generic desktop executable.
