# Cincinnati Hotel Chatbot - Simple Guide

**What is this?** A smart chatbot that answers hotel questions + an admin tool to upload files.

---

## 📋 What You Need

```
1. Node.js (v18 or newer)
2. PostgreSQL (database)
3. An OpenAI API key
4. A Pinecone account
5. Google Drive access
6. n8n (for automation)
```

**Don't have these?**
- Node.js: Download from nodejs.org
- PostgreSQL: Download from postgresql.org
- OpenAI key: Sign up at openai.com, create API key
- Pinecone: Sign up at pinecone.io
- Google Drive: Use your existing Google account
- n8n: Sign up at n8n.io or run locally with Docker

---

## 🚀 Get Started (5 Steps)

### Step 1: Download the Project

```bash
git clone <project-url>
cd chatBot-ai
```

### Step 2: Set Up Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` file with your keys:
```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
OPENAI_API_KEY=sk-your-key
PINECONE_API_KEY=your-key
```

Then run:
```bash
npm run migrate:up
npm run dev
```

### Step 3: Set Up Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

### Step 4: Set Up n8n

Open: `http://localhost:5678`
- Add your API keys (OpenAI, Pinecone, Google Drive)
- Upload workflows from `Workflow-Backup` folder

### Step 5: Test It

Open `http://localhost:5173` in your browser

---

## 🖥️ Admin Dashboard

**What it does:** Upload PDFs, view chat statistics, monitor activity

**Main features:**
- Upload/manage PDF documents
- See total chats and message breakdown by topic
- View recent sessions and activity
- Real-time analytics updates

**Data flow:** Admin uploads PDF → Backend stores → n8n processes → Pinecone indexes → Dashboard updates

---

## 💬 How the Chat Works

```
User types a question
        ↓
Backend receives it
        ↓
n8n searches PDF (via Pinecone)
        ↓
AI generates answer
        ↓
Answer sent back to user
```

**Simple version:** Your PDF is turned into a searchable database. When someone asks a question, the system finds the relevant part of the PDF and uses AI to answer.

---

## 📊 Two Ways to Use It

### For Guests (Chat)
1. Click "Start Chatting"
2. Ask any question about the hotel
3. Get instant answers
4. If chatbot doesn't know → fill out contact form

### For Admin (Upload Files)
1. Click "Admin Dashboard"
2. Upload a PDF with hotel info
3. Watch the dashboard update
4. See how many questions guests asked
5. See topics people ask about most

---

## 🗂️ File Structure (Simple Version)

```
chatBot-ai/
├── backend/          ← Server (handles all requests)
├── frontend/         ← Website (what users see)
├── Workflow-Backup/  ← Automation rules
└── DOCUMENTATION.md  ← Full technical details
```

---

## 🔧 Common Tasks

### Upload a PDF to the Chatbot
1. Go to Admin Dashboard
2. Drag and drop your PDF
3. Click "Upload PDF"
4. Wait 30 seconds for processing
5. Done! Chatbot now knows this information

### Check How Many People Used the Chat
1. Go to Admin Dashboard
2. See "Total Chat Sessions" number
3. See "Questions by Topic" chart

### Fix: Chat Not Working
- Check: Is backend running? (`npm run dev` in backend folder)
- Check: Is frontend running? (`npm run dev` in frontend folder)
- Check: Are API keys in `.env` file correct?

### Fix: Admin Upload Fails
- Check: Is the file a PDF?
- Check: Is file smaller than 50MB?
- Check: Is Google Drive API set up?

---

## 🌐 Parts of the System

### Frontend (What Users See)
- Landing page (choose: chat or admin)
- Chat page (talk to chatbot)
- Admin page (upload files, see stats)

**Tools used:** React, Material UI, Vite

### Backend (What Does the Work)
- Receives messages from frontend
- Sends to n8n for processing
- Stores everything in database
- Returns answers

**Tools used:** Node.js, Express, PostgreSQL

### n8n (The Brain)
- Reads your PDF
- Turns it into searchable format
- When asked a question, finds the right part
- Uses AI to write a good answer

**Tools used:** n8n, OpenAI, Pinecone, Google Drive

### Database (The Memory)
- Stores all chat messages
- Stores user sessions
- Stores contact forms
- Stores admin uploads

**Tools used:** PostgreSQL

---

## 📌 Key Things to Know

| What | Where | Why |
|------|-------|-----|
| Chat happens | Frontend (browser) | Users see it |
| Processing happens | n8n | Automates the work |
| Data stored | PostgreSQL | Remember everything |
| API keys | .env file | Keeps secrets safe |

---

## 🎯 Step-by-Step First Run

**You'll need 3 terminal windows open:**

**Window 1 (Backend):**
```bash
cd backend
npm run dev
```
Expected: `Server running on port 3000`

**Window 2 (Frontend):**
```bash
cd frontend
npm run dev
```
Expected: `Local: http://localhost:5173`

**Window 3 (n8n):**
```bash
n8n start
```
Expected: `Web server is running on http://localhost:5678`

Then open `http://localhost:5173` and test it!

---

## 🚨 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Cannot connect to database" | Check PostgreSQL is running: `psql -U postgres` |
| "API key error" | Check `.env` file has correct keys |
| "Port 3000 already in use" | Use different port: `PORT=3001 npm run dev` |
| "n8n workflows not running" | Restart n8n and activate workflows |
| "Chat not responding" | Check all 3 servers are running |
| "Upload doesn't work" | Make sure PDF is smaller than 50MB |

---

## 📁 Important Files

```
.env                  ← Your secret keys (DON'T SHARE!)
package.json          ← List of things to install
src/                  ← The actual code
migrations/           ← Database setup files
Workflow-Backup/      ← n8n automation files
```

---

## 🎓 Understanding the Flow

### When Someone Chats

```
1. User types: "What rooms do you have?"
2. Frontend sends to Backend
3. Backend sends to n8n
4. n8n asks: "What part of the PDF talks about rooms?"
5. Pinecone finds the relevant PDF section
6. OpenAI reads the section and writes an answer
7. Answer sent back to user
8. User sees: "We have 5 types of rooms..."
```

### When Admin Uploads PDF

```
1. Admin selects PDF file
2. Clicks "Upload PDF"
3. Backend receives the file
4. n8n extracts text from PDF
5. n8n breaks text into small pieces
6. n8n sends pieces to Pinecone (searchable database)
7. Status: ✅ Ready to answer questions
```

---

## 🔌 How n8n Workflows Work

### **n8n Overview**

n8n is an automation engine that acts as the "brain" of the chatbot. It handles all the complex AI processing and integrations. Think of it as a visual programming tool where workflows are built by connecting nodes (boxes) together.

**Three Main Workflows:**

### **1️⃣ create-session Workflow**

**When it runs:** Every time a user clicks "Start Chatting"

**What it does:**
```
Webhook Input (from Backend)
       ↓
Generate UUID (unique session ID)
       ↓
Return session ID to Backend
```

**The Flow:**
- Backend calls: `POST /webhook/create-session`
- n8n generates a random UUID (like: `550e8400-e29b-41d4-a716...`)
- UUID is stored in database so we can track conversations
- User gets a chat room with this ID

**Database Impact:**
- Creates new row in `sessions` table
- Stores: session_id, created_at, message_count=0

---

### **2️⃣ process-chat-message Workflow** (The Complex One!)

**When it runs:** Every time a user sends a message

**What it does:**
```
User Message
       ↓
Extract data (sessionId + message)
       ↓
AI Agent receives:
   - Your message
   - Conversation history (last 5 messages)
   - Access to hotel knowledge base
       ↓
AI Agent uses "hotel-chatbot-data" tool to:
   1. Convert your question to embeddings (math vectors)
   2. Search Pinecone vector database for similar content
   3. Find relevant PDF sections
       ↓
OpenAI GPT-4 mini reads the PDF sections + your question
       ↓
Classifies message into topic (Rooms, Restaurant, Pool, etc.)
Determines: "Can I answer this?" (yes/no)
       ↓
Returns structured response:
{
  "output": "Here's the answer...",
  "topic": "Rooms",
  "noAnswerFound": false
}
       ↓
Send back to Backend
```

**The Nodes Explained:**

1. **Webhook Node** - Listens for POST requests from backend
   - Receives: `sessionId` and `userMessage`

2. **Code Node** - Extracts the important data
   - Gets session ID and user message from request
   - Adds timestamp

3. **AI Agent Node** - The "brain" powered by OpenAI
   - Uses GPT-4 mini model
   - Has access to conversation history (Simple Memory)
   - Can use tools (like hotel-chatbot-data)
   - Classifies message into topics
   - Generates intelligent responses

4. **Simple Memory Node** - Remembers conversation history
   - Keeps last 5 messages
   - Helps AI understand context
   - Example: If user asks "Tell me more", AI knows what "that" refers to

5. **hotel-chatbot-data Tool** - Vector search tool
   - Searches your uploaded PDF
   - How it works:
     ```
     Your question: "What rooms do you have?"
          ↓
     Convert to embeddings (1536 numbers that represent meaning)
          ↓
     Search Pinecone for similar embeddings
          ↓
     Find PDF sections about "rooms"
          ↓
     Return relevant excerpts to AI
     ```

6. **Code Node** - Parses the AI response
   - Extracts: output (answer), topic, noAnswerFound flag
   - Ensures valid JSON format

7. **Respond to Webhook** - Sends response back
   - Returns complete JSON with AI response
   - Backend stores this in database

**Example Workflow in Action:**

User: "Do you have WiFi?"

```
WORKFLOW PROCESSES:
1. Webhook receives: sessionId="abc123", userMessage="Do you have WiFi?"
2. Extract data
3. Simple Memory loads: "Previous 5 messages from this chat"
4. AI Agent gets: "You are a hotel assistant. Here's history... user asks: Do you have WiFi?"
5. AI calls hotel-chatbot-data tool:
   - Converts "Do you have WiFi?" to embeddings
   - Searches Pinecone: Looking for documents about "WiFi" or "internet"
   - Finds: "Hotel features WiFi in all rooms and lobby"
6. AI generates: 
   {
     "output": "Yes, we offer complimentary WiFi throughout the hotel including all rooms and lobby areas.",
     "topic": "Facilities",
     "noAnswerFound": false
   }
7. Parse and respond
8. Send back to backend

BACKEND THEN:
- Saves user message to database with topic="Facilities"
- Saves AI response to database
- Increments message count for this session
- Updates statistics (topics, questions asked, etc.)
```

**Database Impact:**
- Stores 2 messages (user + AI) with topic
- Marks if it was an unanswered question
- Updates session message count
- Triggers stats update event

---

### **3️⃣ file-upload Workflow**

**When it runs:** When admin uploads a PDF

**What it does:**
```
Admin uploads PDF
       ↓
Backend converts PDF to base64
       ↓
Webhook receives base64 + filename
       ↓
Decode base64 back to binary
       ↓
Upload to Google Drive (backup)
       ↓
Return success
```

**The Nodes:**

1. **Webhook Node** - Receives file upload
   - Gets: base64 encoded PDF, filename, mimetype

2. **Code Node** - Decodes base64 to binary
   - Converts base64 string → file buffer
   - Prepares for upload

3. **Upload to Google Drive Node** - Saves PDF to cloud
   - Uses OAuth authentication
   - Uploads to "chatbot-data" folder
   - Returns file ID

**What Happens After (Automatic):**

Once file is in Google Drive, the Pinecone embedding workflow:
1. Extracts text from PDF
2. Splits text into chunks (paragraphs/sentences)
3. Sends each chunk to OpenAI to create embeddings
4. Stores embeddings in Pinecone with metadata
5. Now ready for "process-chat-message" workflow to search

**Example:**

Admin uploads: "hotel-info.pdf" with content:
```
"Deluxe Room: King bed, bathroom, TV, WiFi"
"Standard Room: Queen bed, bathroom, TV"
"Suite: 2 bedrooms, kitchen, living room"
```

What gets stored in Pinecone:
```
Chunk 1: "Deluxe Room: King bed..." → [embedding vector]
Chunk 2: "Standard Room: Queen..." → [embedding vector]
Chunk 3: "Suite: 2 bedrooms..." → [embedding vector]
```

Later, when user asks "What rooms do you have?":
- Question converts to embedding
- Pinecone finds similar embeddings (all room descriptions)
- AI gets the 3 chunks as context
- AI generates answer about all room types

---

## 🔗 How Everything Connects

```
┌─ FRONTEND ─┐
│   React    │
│ :5173      │
└─────┬──────┘
      │ HTTP
      ▼
┌─ BACKEND ─────────┐
│  Node.js/Express  │
│  :3000            │
│  - Routes         │
│  - Services       │
└─────┬──────────────┘
      │ Webhook calls (HTTP POST)
      ├─────────────────┬──────────┬────────────┐
      │                 │          │            │
      ▼                 ▼          ▼            ▼
┌──────────┐    ┌──────────────┐ ┌─────────┐ ┌────────┐
│ n8n      │    │ n8n          │ │ n8n     │ │ n8n    │
│:5678     │    │ :5678        │ │ :5678   │ │ :5678  │
│create-   │    │ process-chat │ │ file-   │ │ delete │
│session   │    │ -message     │ │upload   │ │        │
└──────────┘    └──────┬───────┘ └────┬────┘ └────────┘
                       │              │
                       │Uses:         │Uses:
                       ├─ OpenAI      ├─ Google Drive
                       ├─ Pinecone    └─ (stores backup)
                       └─ Memory
      ▲                │
      │                │ Response (HTTP)
      └────────────────┘
      
      ▼
┌─────────────────────────┐
│  PostgreSQL Database    │
│  - sessions             │
│  - messages             │
│  - contact_submissions  │
│  - files                │
└─────────────────────────┘
```

---

## 📋 Workflow Configuration Checklist

Before running workflows, make sure n8n has:

```
✅ OpenAI Credentials
   - API key: sk-your-openai-key
   - Used by: process-chat-message (GPT-4 mini)

✅ Pinecone Credentials
   - API key from pinecone.io
   - Index: chat-bot-hotel
   - Namespace: hotel-chat-bot
   - Used by: process-chat-message (search PDFs)

✅ Google Drive Credentials
   - OAuth2 authentication
   - Folder: "chatbot-data"
   - Used by: file-upload (backup storage)

✅ All Workflows Activated
   - Status should show: "Webhook listening"
   - Check URLs are correct:
     • /webhook/create-session
     • /webhook/process-message
     • /webhook/upload-file
```

---

## 💾 Database Tables (What Gets Saved)

| Table | What's Stored | Why |
|-------|---------------|-----|
| `sessions` | Chat room IDs | Know which chat belongs to whom |
| `messages` | All messages | Keep chat history |
| `contact_submissions` | Contact forms | Follow up with customers |
| `files` | Uploaded PDFs | Know which PDF is active |

---

## 🔑 API Endpoints (The Buttons)

Think of these as buttons the frontend presses:

```
GET    /api/health              → Is backend working?
POST   /api/chat/session        → Start new chat
POST   /api/chat/message        → Send message
POST   /api/chat/contact        → Submit contact form
POST   /api/admin/upload-pdf    → Upload PDF
GET    /api/admin/stats         → Get statistics
```

---

## 🚀 Extending the System

**Add new features by modifying these parts:**

### Quick Patterns

| What to Add | Where to Change | Steps |
|------------|-----------------|-------|
| New chat feature | Frontend component + Backend route | 1. Edit React component, 2. Add API endpoint, 3. Test |
| New n8n workflow | n8n UI | 1. Create workflow, 2. Connect webhook, 3. Call from backend |
| New database table | Migration + Backend service | 1. Create `.sql` migration, 2. Run `npm run migrate:up`, 3. Add service function |
| AI behavior change | n8n AI Agent prompt | 1. Edit system prompt in workflow, 2. Test responses |
| Integration (Slack, etc) | n8n webhook + credentials | 1. Add credentials in n8n, 2. Add webhook node, 3. Configure format |

### File Locations

- **Frontend code:** `frontend/src/components/` and `frontend/src/pages/`
- **Backend routes:** `backend/src/routes/`
- **Backend services:** `backend/src/services/`
- **Database migrations:** `backend/migrations/`
- **n8n workflows:** Import/export from n8n UI

### Testing Changes

```bash
# After changing frontend
npm run dev  # in frontend/ folder

# After changing backend
npm run dev  # in backend/ folder

# After database changes
npm run migrate:up

# n8n workflows
# Test directly in n8n UI at http://localhost:5678
```

### Common Issues

- **Endpoint returns 404:** Restart backend
- **Workflow not triggering:** Check webhook URL matches
- **Migration fails:** Check SQL syntax, run `npm run migrate:down` first
- **Changes not showing:** Hard refresh browser (Ctrl+Shift+Del)

---

## 🛠️ Commands You'll Use

```bash
# Install packages
npm install

# Start development
npm run dev

# Check for code errors
npm run lint

# Prepare for deployment
npm run build

# Update database
npm run migrate:up
```

---

## 🌟 What Makes This Special

✅ **Simple to Use** - No login needed  
✅ **Smart Answers** - Uses AI + your PDF  
✅ **Real-time Stats** - See activity instantly  
✅ **Persistent** - Remembers chats  
✅ **Professional** - Beautiful design  


**That's it! You now understand the Cincinnati Hotel Chatbot! 🏨**
