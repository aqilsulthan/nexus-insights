# Nexus Insights : Smart Knowledge Management & RAG Chatbot

Next.js 14 application serving as a smart knowledge portal, featuring an editorial blog, an AI-powered Knowledge Management Agent for auto-generating articles, a document upload admin panel, and a RAG (Retrieval-Augmented Generation) chatbot powered by Dify Workflows.

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

## Features & Pages

| Route | Description |
|---|---|
| `/` | Home — featured article grid |
| `/blog/[slug]` | Article detail with insights, stats, and original source references |
| `/ask` | "Ask Insights" RAG chatbot powered by Dify Workflow |
| `/admin` | Admin dashboard for document uploads, auto-generating blog posts via AI, and Knowledge Base management |

---

## Dify Workflows Integration

This project is tightly integrated with [Dify.ai](https://dify.ai) using two separate Workflows:

### 1. Knowledge Management Agent Workflow
**Purpose:** Processes uploaded documents (PDF, TXT, MD, DOCX), extracts key information, checks for existing topics, and either writes a new Professional-style blog article or updates an existing one with a "What's New" section. Then, it returns plain text to be indexed into the Dify Knowledge Base.
- **Required API Key:** `DIFY_AGENT_API_KEY`

### 2. RAG Workflow ("Ask Insights")
**Purpose:** A conversational chatbot that answers user questions using ONLY the curated documents indexed in your Dify Knowledge Base. It provides grounded answers with inline citations [1], [2] and returns structured reference cards (blog, video, document).
- **Required API Key:** `DIFY_WORKFLOW_API_KEY`

---

## Environmental Variables

You need to configure the following environment variables in your `.env.local` file:

```env
# Dify Base URL (Cloud: https://api.dify.ai/v1 or your self-hosted URL)
DIFY_BASE_URL=http://your-dify-instance.com/v1

# API Key for Knowledge Management Agent Workflow
DIFY_AGENT_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx

# API Key for RAG Workflow Chatbot
DIFY_WORKFLOW_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx

# Dify Knowledge Base (Dataset) ID for document uploads
DIFY_DATASET_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# API Key specifically for the Dataset (starts with dataset-...)
DIFY_DATASET_API_KEY=dataset-xxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Workflow YAML Imports

In the `dify/` folder of this repository, you will find the exported YAML files for both workflows:
- `knowledge-management-agent-aqil.yml`
- `rag-workflow-aqil.yml`

You can import these DSL context files directly into your Dify Studio to instantly recreate the exact nodes, configurations, python code formatting, and prompts required by this application.

---

## Admin & Content Management

1. Go to `/admin`.
2. Upload a file (PDF, TXT, DOCX, etc.) and define the author.
3. The **Knowledge Management Agent** automatically processes the document.
4. If the topic is new, an article is generated. If the topic exists, a `.1` or `.2` version update is created incorporating the new information.
5. The extracted plain text is simultaneously pushed to the Dify Knowledge Base using the `DIFY_DATASET_API_KEY`.
6. Previous documents related to updated articles are automatically deleted from the Knowledge Base to prevent the RAG system from sourcing outdated information.

---

## Architecture Flow

```
/api/process/route.ts     → triggers Knowledge Agent, saves article, uploads content to Dify KB
/api/chat/route.ts        → calls Dify RAG Workflow for chatbot responses
/api/documents/route.ts   → handles direct KB file uploads & indexing status
/api/topics/route.ts      → manages local article (topics) JSON data
/lib/dify-client.ts       → shared Dify SDK logic (runWorkflow, streamWorkflow, uploadDocument)
/lib/topics-store.ts      → manages CRUD operations and version snapshots for local articles
```
