# Transkriber

A simple web application that transcribes MP3 audio files using Google's Gemini AI. Built with SvelteKit and TailwindCSS.

## Features

- Upload MP3 audio files
- Transcribe audio using Gemini AI
- View transcriptions in plain text or markdown format
- Export transcriptions as TXT or MD files
- Modern UI with dark mode support

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add your Google API key:

```
VITE_GOOGLE_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

## Building

To create a production version:

```bash
npm run build
```

Preview the production build with:

```bash
npm run preview
```

## Technologies Used

- SvelteKit
- TailwindCSS
- Google Gemini AI
- Marked (for Markdown parsing)
- Bits UI (for UI components)
