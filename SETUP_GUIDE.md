# Complete Setup Guide — Insights Platform + Dify Knowledge Agent

## Overview

This guide walks you through setting up the full system from zero:

```
Your Computer / Server
  ├── Next.js App (localhost:3000)
  │     ├── /           → Blog home
  │     ├── /ask        → RAG chatbot
  │     ├── /admin      → Upload & manage docs
  │     └── /blog/[slug]→ Article pages
  └── Dify (cloud.dify.ai or self-hosted)
        ├── Knowledge Agent Workflow  ← processes uploads
        ├── RAG Chatbot Workflow      ← powers /ask
        └── Knowledge Base Dataset   ← stores indexed content
```

---

## PART 1 — Prerequisites

Install these before starting:

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 18+ | `node --version` |
| npm | 9+ | `npm --version` |
| Git | any | `git --version` |

---

## PART 2 — Set Up the Next.js App

### Step 1 — Extract the project

```bash
# Unzip the downloaded file
unzip nexus-insights-workflow.zip
cd nexus-insights
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Create your environment file

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor. You will fill it in during Parts 3 and 4.

### Step 4 — Create the data directory

```bash
mkdir -p data
```

This is where the topics store saves articles as `data/topics.json`.

### Step 5 — Verify the file structure

Your project should look like this:

```
nexus-insights/
├── data/                         ← created in step 4
├── dify/
│   ├── knowledge-agent.yaml      ← import this into Dify (Part 3)
│   └── rag-workflow.yaml         ← import this into Dify (Part 4)
├── src/
│   ├── app/
│   │   ├── page.tsx              ← home
│   │   ├── ask/page.tsx          ← chatbot
│   │   ├── admin/page.tsx        ← document management
│   │   ├── blog/[slug]/page.tsx  ← article detail
│   │   └── api/
│   │       ├── chat/route.ts     ← RAG chat endpoint
│   │       ├── process/route.ts  ← Knowledge Agent endpoint
│   │       ├── topics/route.ts   ← topics CRUD
│   │       └── documents/        ← KB document management
│   └── lib/
│       ├── dify-client.ts        ← Dify API functions
│       ├── topics-store.ts       ← article storage
│       └── knowledge-base.ts     ← static fallback articles
├── .env.local                    ← your config (never commit this)
└── package.json
```

---

## PART 3 — Set Up Dify Knowledge Agent

The Knowledge Agent processes uploaded documents and auto-generates blog articles.

### Step 1 — Create a Dify account

Go to https://cloud.dify.ai and create a free account.
(Or use your self-hosted Dify instance.)

### Step 2 — Import the Knowledge Agent workflow

1. In Dify, click **Studio** in the top navigation
2. Click **Create App**
3. Select **Import DSL file**
4. Upload: `dify/knowledge-agent.yaml`
5. Name it: `Knowledge Management Agent`
6. Click **Create**

You should see a 6-node workflow:
```
Start → Document Classifier → Content Extractor → Topic Detector → [If/Else] → New Blog Generator / Update Generator → KB Indexer → End
```

### Step 3 — Configure the LLM nodes

For each LLM node (Document Classifier, Content Extractor, Topic Detector, New Blog Generator, Update Generator):

1. Click the node
2. Under **Model**, select your preferred LLM

### Step 4 — Publish the workflow

1. Click **Publish** (top right)
2. Click **Run** to test — it should load without errors

### Step 5 — Get the Agent API Key

1. Click **API Access** (top right of your workflow)
2. Copy the **API Key** (starts with `app-`)
3. Add to `.env.local`:
   ```
   DIFY_AGENT_API_KEY=app-xxxxxxxxxxxxxxxxxxxx
   ```

---

## PART 4 — Set Up the RAG Workflow (for Ask Insights chatbot)

### Step 1 — Import the RAG workflow

1. Click **Studio → Create App → Import DSL file**
2. Upload: `dify/rag-workflow.yaml`
3. Name it: `Ask Insights RAG Workflow`
4. Click **Create**

### Step 2 — Create the Knowledge Base

1. Click **Knowledge** in the top navigation
2. Click **Create Knowledge**
3. Name it: `Insights Knowledge Base`
4. Choose **Import from file** or just click **Create** (you'll upload docs via the admin UI)
5. Click **Save**

### Step 3 — Link Knowledge Base to the RAG Workflow

1. Open your RAG Workflow in Studio
2. Click the **Knowledge Retrieval** node
3. Under **Select Dataset**, choose `Insights Knowledge Base`
4. Set **Top K**: 5
5. Set **Score Threshold**: 0.5
6. Click **Save**

### Step 4 — Configure the LLM node

Same as Part 3 Step 3 — select your LLM model.

### Step 5 — Get the RAG Workflow API Key

1. Click **API Access** in your RAG workflow
2. Copy the API Key
3. Add to `.env.local`:
   ```
   DIFY_WORKFLOW_API_KEY=app-xxxxxxxxxxxxxxxxxxxx
   ```

---

## PART 5 — Set Up the Knowledge Base Dataset

### Step 1 — Get the Dataset ID

1. In Dify, click **Knowledge**
2. Click your `Insights Knowledge Base`
3. Look at the URL in your browser:
   ```
   https://cloud.dify.ai/datasets/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/documents
   ```
4. Copy the UUID (the long string between `/datasets/` and `/documents`)
5. Add to `.env.local`:
   ```
   DIFY_DATASET_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

---

## PART 6 — Final .env.local

Your complete `.env.local` should look like this:

```env

# Dify Knowledge Agent (processes uploads → generates blog articles)
DIFY_AGENT_API_KEY=app-xxxxxxxxxxxxxxxxxxxx

# Dify RAG Workflow (powers the /ask chatbot)
DIFY_WORKFLOW_API_KEY=app-yyyyyyyyyyyyyyyyyyyy

# Dify Knowledge Base Dataset ID (for document indexing)
DIFY_DATASET_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Dify Base URL (default is Dify Cloud — change for self-hosted)
DIFY_BASE_URL=https://api.dify.ai/v1
```

---

## PART 7 — Run the App

```bash
npm run dev
```

Open http://localhost:3000

---

## PART 8 — Test the Full Flow

### Test 1: Upload a document

1. Go to http://localhost:3000/admin
2. Click **Upload & Process** tab
3. Drop a PDF, TXT, or DOCX file
4. Fill in Author Name (optional)
5. Click **Process & Publish**
6. Watch the agent pipeline run (takes 30-90 seconds)
7. When complete, you'll see: ✅ "New Topic Published" or "Existing Topic Updated"
8. Click **View Article** to see the generated blog post

### Test 2: Check the Knowledge Base

1. Click **Knowledge Base** tab in /admin
2. You should see the processed document with status "Ready"

### Test 3: Ask the chatbot

1. Go to http://localhost:3000/ask
2. Ask about the topic you just uploaded
3. The response should cite your document in the references section

### Test 4: Update an existing topic

1. Upload a new document on the same topic (e.g., a 2025 update of a 2024 report)
2. The agent should detect the existing article and update it to v2.0
3. The blog post will show a version badge and "What's New" section

---

## PART 9 — Architecture Reference

### How a document upload flows through the system

```
User drops PDF on /admin
        ↓
POST /api/process (Next.js)
        ↓
1. File uploaded to Dify Files API → gets file_id
        ↓
2. Dify Knowledge Agent Workflow runs:
   ├─ Node 1: Document Classifier
   │    Detects file type, extracts clean text
   ├─ Node 2: Content Extractor
   │    Identifies title, stats, sections, quotes, tags
   ├─ Node 3: Topic Detector
   │    Compares slug against existing articles
   ├─ Node 4: If/Else
   │    Routes to New Blog Generator OR Update Generator
   ├─ Node 5a: New Blog Generator
   │    Writes full Professional-style article HTML
   ├─ Node 5b: Update Generator
   │    Updates article with "What's New" + new version
   └─ Node 6: KB Indexer (Code)
        Formats JSON payload + extracts plain text
        ↓
3. Next.js receives: { article JSON, kb_text, action, version }
        ↓
4. Upsert article into data/topics.json (topics store)
        ↓
5. Upload kb_text to Dify Knowledge Base dataset
        ↓
6. Return result to admin UI
```

### How a chat question flows through the system

```
User asks question in /ask
        ↓
POST /api/chat (Next.js)
        ↓
Dify RAG Workflow runs:
  ├─ Knowledge Retrieval → finds top 5 relevant chunks
  ├─ LLM → generates grounded answer with [1][2][3] citations
  └─ Code → formats reference cards (blog/video/document)
        ↓
Next.js returns: { answer, references[], disclaimer }
        ↓
Frontend renders:
  ├─ Formatted markdown with inline citations
  ├─ Article reference cards → link to /blog/[slug]
  ├─ Video reference cards
  └─ Document reference cards
```

---

## PART 10 — Troubleshooting

### "DIFY_AGENT_API_KEY not configured"
→ Make sure `.env.local` exists and has `DIFY_AGENT_API_KEY` set.
→ Restart `npm run dev` after editing `.env.local`.

### "Agent workflow failed [401]"
→ Your Dify API key is wrong or expired.
→ Go to Dify → your app → API Access → regenerate and copy the key.

### "Agent returned empty result"
→ The Dify workflow ran but produced no output.
→ Check the workflow in Dify Studio → click **Logs** to see what failed.
→ Most common cause: LLM provider not configured (no API key in Dify Settings → Model Providers).

### "JSON parse error in KB Indexer"
→ The LLM returned non-JSON output.
→ In your LLM node, add to the system prompt: "Output ONLY valid JSON. No markdown code fences. No preamble."

### Topics not appearing on homepage
→ The homepage (`/`) uses static articles from `knowledge-base.ts`.
→ Dynamic topics from uploads show on `/blog/[slug]` but the home page needs to be updated to also read from `/api/topics`.
→ Quick fix: refresh `/admin → Published Topics` tab to confirm the article is stored, then visit `/blog/your-slug` directly.

### Chat returns "Topic isn't covered in our insights"
→ The Knowledge Base doesn't have enough content yet.
→ Upload more documents via /admin first.
→ Check Knowledge Base tab in /admin — documents must show status "Ready" before they're searchable.

---

## PART 11 — Production Deployment

### Deploy to Vercel (recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# Settings → Environment Variables → add all .env.local values
```

Note: `data/topics.json` won't persist on Vercel's serverless functions.
For production, replace `topics-store.ts` with a database:
- **Supabase** (PostgreSQL, free tier): https://supabase.com
- **PlanetScale** (MySQL): https://planetscale.com
- **MongoDB Atlas** (free tier): https://mongodb.com/atlas

### Deploy to a VPS (persistent storage)

```bash
# On your server
git clone your-repo
cd nexus-insights
npm install
npm run build

# Use PM2 to keep it running
npm install -g pm2
pm2 start npm --name "insights" -- start
pm2 save
pm2 startup
```

---

## PART 12 — Self-Hosted Dify (optional)

If you want to run Dify on your own server:

```bash
# Requirements: Docker + Docker Compose

git clone https://github.com/langgenius/dify.git
cd dify/docker

# Copy and configure environment
cp .env.example .env
# Edit .env — set SECRET_KEY, database passwords, etc.

# Start
docker compose up -d

# Dify runs at http://localhost
# Update DIFY_BASE_URL in .env.local:
DIFY_BASE_URL=http://localhost/v1
```

---

## Quick Reference — All URLs

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Blog home |
| http://localhost:3000/ask | AI chatbot |
| http://localhost:3000/admin | Document management |
| http://localhost:3000/blog/[slug] | Article detail |
| http://localhost:3000/api/process | POST: process document |
| http://localhost:3000/api/topics | GET/DELETE: manage topics |
| http://localhost:3000/api/chat | POST: chat with RAG |
| http://localhost:3000/api/documents | GET/POST: KB documents |
| https://cloud.dify.ai/studio | Dify workflow editor |
| https://cloud.dify.ai/datasets | Dify knowledge bases |
