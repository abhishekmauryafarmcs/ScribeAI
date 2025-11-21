# ScribeAI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Setup Database

```bash
# Start PostgreSQL with Docker
docker-compose up -d

# Wait 10 seconds for PostgreSQL to start
```

### 2. Configure Environment

Create a `.env` file (copy from `.env.example`):

```bash
DATABASE_URL="postgresql://scribeai:scribeai_password@localhost:5432/scribeai"
GEMINI_API_KEY="YOUR_KEY_HERE"  # Get from ai.google.dev
BETTER_AUTH_SECRET="change-this-to-random-32-character-string"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SOCKET_SERVER_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Get Gemini API Key**:
1. Visit: https://ai.google.dev/aistudio
2. Click "Get API key"
3. Create new API key
4. Copy and paste into `.env`

### 3. Run Database Migration

```bash
npm run db:migrate
```

When prompted, enter a migration name: `init`

### 4. Start Both Servers

**Terminal 1** (Next.js):
```bash
npm run dev
```

**Terminal 2** (WebSocket Server):
```bash
npm run websocket
```

### 5. Open Browser

Navigate to: http://localhost:3000

🎉 **You're ready to go!**

---

## 📖 How to Use

1. **Register**: Create an account
2. **Start Session**: Click "Start New Session"
3. **Record**: Grant microphone permission, click "Start Recording"
4. **Speak**: Talk into your microphone
5. **Watch**: Live transcript appears every 30 seconds
6. **Stop**: Click "Stop" to generate AI summary
7. **Export**: Download transcript as TXT or JSON

---

## 🔧 Common Issues

**"Cannot connect to database"**
- Make sure Docker is running: `docker ps`
- Restart PostgreSQL: `docker-compose restart`

**"WebSocket connection failed"**
- Check port 3001 is not in use: `netstat -ano | findstr :3001`
- Restart WebSocket server

**"Gemini API error"**
- Verify API key in `.env`
- Check quota at ai.google.dev

---

## 📂 Project Files

```
50+ files created including:
✅ 34 committed to Git
✅ Next.js app with TypeScript
✅ Prisma database schema
✅ WebSocket server
✅ React components
✅ API routes
✅ Documentation
```

---

## 📚 Documentation

- **[README.md](./README.md)** - Project overview & architecture
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[walkthrough.md](./.gemini/walkthrough.md)** - Implementation details
- **[task.md](./.gemini/task.md)** - Task breakdown & progress

---

## 🏗️ Next Steps

Ready for production? See SETUP.md for:
- Deployment to Vercel/Railway
- Using Supabase for PostgreSQL
- Environment configuration
- Testing & optimization

---

**Questions?** Check SETUP.md or README.md for detailed documentation.
