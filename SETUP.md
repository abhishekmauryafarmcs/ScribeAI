# ScribeAI - Setup Guide

## Prerequisites

- Node.js 18+ installed
- Docker Desktop (for PostgreSQL) OR Supabase account
- Gemini API key from [ai.google.dev](https://ai.google.dev)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

**Option A: Local PostgreSQL with Docker**

```bash
docker-compose up -d
```

**Option B: Supabase**

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the connection string

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# If using Docker
DATABASE_URL="postgresql://scribeai:scribeai_password@localhost:5432/scribeai"

# Or if using Supabase
DATABASE_URL="your-supabase-connection-string"

# Get API key from ai.google.dev
GEMINI_API_KEY="your-gemini-api-key"

# Generate a random secret (min 32 chars)
BETTER_AUTH_SECRET="your-random-secret-here"
```

### 4. Run Database Migrations

```bash
npm run db:generate
npm run db:migrate
```

### 5. Start Development Servers

**Terminal 1 - Next.js Frontend:**
```bash
npm run dev
```

**Terminal 2 - WebSocket Server:**
```bash
npm run websocket
```

### 6. Access the Application

- Frontend: http://localhost:3000
- WebSocket Server: http://localhost:3001

## Project Structure

```
scribe-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── sessions/          # Session detail pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── audio/            # AudioRecorder
│   └── sessions/         # TranscriptViewer, SessionList
├── hooks/                # Custom React hooks
│   └── useSocket.ts      # Socket.io client hook
├── lib/                  # Utilities
│   ├── auth.ts          # Better Auth config
│   └── prisma.ts        # Prisma client
├── prisma/              # Database
│   └── schema.prisma    # Database schema
├── server/              # WebSocket server
│   ├── handlers/        # Socket.io event handlers
│   ├── services/        # Business logic
│   └── index.ts         # Server entry point
└── README.md

Total: ~50 files
```

## Database Schema

- **User**: Stores user accounts (email, password hash)
- **Session**: Recording sessions (title, status, transcript, summary)
- **AudioChunk**: Audio data chunks (sequence, binary data, transcript)

## Key Features

✅ Real-time audio transcription  
✅ Microphone & tab share capture  
✅ Live transcript streaming  
✅ AI-generated summaries  
✅ Session history  
✅ Export transcripts (TXT/JSON)  
✅ Dark mode support  
✅ Auto-save on disconnect  

## Troubleshooting

### Cannot connect to database
- Check PostgreSQL is running: `docker-compose ps`
- Verify DATABASE_URL in .env matches your setup

### WebSocket connection failed
- Ensure WebSocket server is running on port 3001
- Check NEXT_PUBLIC_SOCKET_SERVER_URL in .env

### Microphone permission denied
- Grant browser permission when prompted
- Check browser settings → Privacy → Microphone

### Gemini API errors
- Verify GEMINI_API_KEY is valid
- Check API quota at ai.google.dev

## Development Commands

```bash
npm run dev          # Start Next.js dev server
npm run websocket    # Start WebSocket server
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:migrate   # Run database migrations
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Production Deployment

1. Build Next.js:
   ```bash
   npm run build
   npm start
   ```

2. Run WebSocket server:
   ```bash
   NODE_ENV=production npm run websocket
   ```

3. Use production PostgreSQL (RDS, Supabase, etc.)

4. Set environment variables on your hosting platform

## License

MIT
