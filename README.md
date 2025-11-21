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
- ✨ **Cursor Glow Effect** - Interactive cursor follower for enhanced visibility
- 🎭 **Smooth Animations** - Cards animate in with staggered delays
- 🏠 **Easy Navigation** - Home icon on auth pages

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


## 🎯 Key Features Explained

### Real-Time Transcription
- **Microphone Mode**: Uses browser's Web Speech API for instant transcription
- **Tab Share Mode**: Captures tab audio and uses Gemini AI for transcription
- **Live Updates**: Transcripts appear in real-time as you speak
- **Chunked Display**: Organized in 30-second chunks for easy review

### AI-Powered Summaries
- **Automatic Generation**: Gemini 2.0 Flash analyzes your transcript
- **Structured Format**: Key points, decisions, action items, and overall summary
- **Markdown Support**: Properly formatted with headers, lists, and emphasis
- **Smart Parsing**: Converts Markdown to beautiful HTML display

### Session Management
- **Save & Review**: All sessions saved to PostgreSQL database
- **Session History**: View all past recordings in dashboard
- **Status Tracking**: Recording, paused, processing, completed states
- **Duration Tracking**: Accurate recording time display
- **Audio Source**: Shows whether recorded from microphone or tab share
- **Time Display**: 12-hour format showing when session started

### User Interface
- **Glass Morphism**: Modern frosted glass effect throughout
- **Cursor Glow**: Interactive spotlight effect following your mouse
- **Scroll Animations**: Cards slide in with staggered timing
- **Responsive Design**: Works on all screen sizes
- **Dark Theme**: Eye-friendly dark interface
- **Export Options**: Download transcripts as TXT or JSON

## 🏗️ Architecture

### Frontend Architecture
```
Next.js 15 (App Router)
├── Server Components (RSC)
├── Client Components (Interactive UI)
├── API Routes (REST endpoints)
└── Middleware (Auth protection)
```

### Backend Architecture
```
WebSocket Server (Socket.IO)
├── Event Handlers (Recording, Transcription)
├── Services (Database, Gemini AI)
└── Real-time Broadcasting
```

### Data Flow
```
User → Browser (Speech API/MediaRecorder)
     → WebSocket → Server
     → Gemini API (Transcription/Summary)
     → PostgreSQL (Storage)
     → WebSocket → Browser (Live Updates)
```

Real-time Speech Processing Cycle
User Speech Input
Browser Display
Browser Processing
WebSocket Update
WebSocket Transmission
PostgreSQL Storage
Server Processing
Gemini API Integration<img width="1584" height="1620" alt="image" src="https://github.com/user-attachments/assets/61309aaa-7130-42ae-bdfb-fef2be8972c1" />


## 🔧 Technical Details

### Audio Processing
- **Microphone**: Web Speech API with continuous recognition
- **Tab Share**: MediaRecorder API with 30-second complete WebM files
- **Format**: WebM with Opus codec at 128kbps
- **Chunk Size**: 30 seconds for optimal transcription quality

### AI Integration
- **Model**: Gemini 2.0 Flash for transcription
- **Model**: Gemini 2.0 Flash for summary generation
- **Context**: Maintains speaker context across chunks
- **Fallback**: Graceful error handling with fallback summaries

### Database Schema
- **Users**: Authentication and profile data
- **Sessions**: Recording metadata and status
- **Chunks**: Individual transcript segments
- **Accounts**: Password hashing with bcrypt

### Real-time Communication
- **Protocol**: WebSocket (Socket.IO)
- **Events**: start-recording, transcript-chunk, audio-chunk, stop-recording
- **Rooms**: Session-based broadcasting
- **CORS**: Configured for localhost and production

## 📊 Performance Optimizations

- ✅ **Connection Pooling**: Prisma singleton pattern
- ✅ **Socket Reuse**: Single WebSocket connection across app
- ✅ **Lazy Loading**: Components load on demand
- ✅ **Database Indexing**: Optimized queries on userId and status
- ✅ **Chunked Processing**: 30-second segments prevent memory issues
- ✅ **Environment-based Logging**: Conditional console logs

## ⏱️ Long-Session Scalability

ScribeAI is architected to handle extended recording sessions efficiently through several key strategies. The 30-second chunking mechanism ensures that audio processing remains memory-efficient regardless of session duration, preventing buffer overflow issues common in long recordings. Each chunk is processed independently and immediately persisted to PostgreSQL, allowing the system to maintain a constant memory footprint even during multi-hour sessions.

The WebSocket architecture supports concurrent long-running sessions through event-driven processing rather than blocking operations. Gemini API calls are asynchronous and rate-limited, preventing service degradation during peak usage. Database writes are batched per chunk, minimizing I/O overhead while maintaining data integrity.

For sessions exceeding several hours, the system gracefully handles browser tab refreshes by maintaining session state server-side. Users can reconnect to active sessions without data loss. The chunked storage model also enables efficient retrieval and pagination of large transcripts, ensuring the UI remains responsive when displaying extensive session histories.

Production deployments should consider horizontal scaling of the WebSocket server behind a load balancer for handling multiple simultaneous long sessions. Database connection pooling (configured via Prisma) prevents connection exhaustion under sustained load. Memory monitoring and automatic garbage collection ensure stable performance across extended recording periods.

## 🚀 Deployment

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
GEMINI_API_KEY="your-gemini-api-key"
BETTER_AUTH_SECRET="your-production-secret-min-32-chars"
BETTER_AUTH_URL="https://your-domain.com"
SOCKET_PORT=3001
FRONTEND_URL="https://your-domain.com"
NEXT_PUBLIC_SOCKET_SERVER_URL="https://your-websocket-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Build Commands
```bash
npm run build        # Build Next.js for production
npm run start        # Start production server
npm run websocket    # Start WebSocket server (use PM2 or similar)
```

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or AWS Amplify
- **WebSocket**: Railway, Render, or AWS EC2
- **Database**: Supabase, Railway, or AWS RDS

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ Real-time WebSocket communication
- ✅ AI API integration (Google Gemini)
- ✅ Browser APIs (Web Speech, MediaRecorder, getDisplayMedia)
- ✅ Full-stack TypeScript development
- ✅ Database design and ORM usage
- ✅ Authentication and authorization
- ✅ Modern UI/UX with animations
- ✅ State management in React
- ✅ Error handling and edge cases

## 🤝 Connect

**Abhishek Maurya**
- GitHub: [@abhishekmauryafarmcs](https://github.com/abhishekmauryafarmcs)
- LinkedIn: [Abhishek Maurya](https://www.linkedin.com/in/abhishek-maurya-707106158/)

## 💝 Special Thanks

A heartfelt thank you to the **Attack Capital Team** for this opportunity. This project was built as a 24-hour hackathon challenge, demonstrating passion for creating real impact through technology.

---

**Built with 💜 for Attack Capital**
