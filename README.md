# ScribeAI - AI-Powered Meeting Transcription

Real-time audio transcription and AI-powered meeting summaries using Google's Gemini 2.0 Flash.

## Features

- 🎤 **Microphone Recording** - Real-time transcription using Web Speech API
- 🖥️ **Tab Share Recording** - Capture and transcribe audio from browser tabs (Google Meet, Zoom, YouTube)
- 🤖 **AI Summaries** - Automatic meeting summaries with key points, decisions, and action items
- 💾 **Session Management** - Save and review past recording sessions
- 📤 **Export** - Download transcripts in TXT or JSON format
- 🔐 **Authentication** - Secure user accounts with Better Auth
- 🌙 **Dark Mode** - Beautiful UI with dark mode support

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Socket.IO, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini 2.0 Flash API
- **Auth**: Better Auth with Prisma adapter

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Google Gemini API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/abhishekmauryafarmcs/ScribeAI.git
cd ScribeAI
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Gemini API
GEMINI_API_KEY="your-gemini-api-key"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:3000"

# WebSocket Server
SOCKET_PORT=3001
FRONTEND_URL="http://localhost:3000"

# Frontend
NEXT_PUBLIC_SOCKET_SERVER_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Open Prisma Studio to view database
npm run db:studio
```

### 5. Run the Application

You need to run both servers:

**Terminal 1 - WebSocket Server:**
```bash
npm run websocket
```

**Terminal 2 - Next.js Dev Server:**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

### Microphone Recording

1. Go to Dashboard
2. Click "Start New Session"
3. Select "🎤 Microphone" as audio source
4. Click "Start Recording"
5. Speak into your microphone
6. See real-time transcription appear
7. Click "Stop" to generate AI summary

### Tab Share Recording

1. Go to Dashboard
2. Click "Start New Session"
3. Select "🖥️ Tab Share" as audio source
4. Click "Start Recording"
5. Select the browser tab with audio (YouTube, Meet, Zoom)
6. **Important**: Check "Share tab audio" in the browser dialog
7. Click "Share"
8. Transcription will appear every 30 seconds
9. Click "Stop" to generate AI summary

## API Keys

### Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and add it to your `.env` file

### Database Setup (Supabase)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Add it to your `.env` file as `DATABASE_URL`

## Scripts

```bash
npm run dev          # Start Next.js development server
npm run build        # Build for production
npm run start        # Start production server
npm run websocket    # Start WebSocket server
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Project Structure

```
scribe-ai/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   └── sessions/          # Session pages
├── components/            # React components
│   ├── audio/            # Audio recording components
│   └── sessions/         # Session-related components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── prisma/               # Prisma schema and migrations
├── server/               # WebSocket server
│   ├── handlers/         # Socket event handlers
│   └── services/         # Business logic services
└── public/               # Static assets
```

## Browser Compatibility

- **Microphone Recording**: Chrome, Edge, Safari (Web Speech API)
- **Tab Share Recording**: Chrome, Edge (getDisplayMedia API)

## Troubleshooting

### Tab Audio Not Transcribing

- Make sure to check "Share tab audio" when selecting the tab
- Wait 30 seconds for the first transcription
- Ensure the tab has active audio playing

### WebSocket Connection Issues

- Check that the WebSocket server is running on port 3001
- Verify `NEXT_PUBLIC_SOCKET_SERVER_URL` in `.env`
- Check browser console for connection errors

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Run `npm run db:generate` to regenerate Prisma Client
- Check database is accessible

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Author

Abhishek Maurya - [GitHub](https://github.com/abhishekmauryafarmcs)

## Acknowledgments

- Google Gemini API for AI transcription and summaries
- Web Speech API for real-time microphone transcription
- Socket.IO for real-time communication
- Next.js and React teams for the amazing frameworks
