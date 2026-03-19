# CodeRefine ✦ Autonomous AI Coding Agent Workspace

**CodeRefine** is an advanced AI coding assistant IDE workspace that replicates continuous autonomous agent execution workflows (e.g., Devin or Cursor). It integrates split-screen code editing with real-time natural language Chat instructions that stream diff layouts directly into visual panels, combined with WebGL based attention monitoring for optimal proctoring.

---

## 📖 Table of Contents
1.  [Overview](#-overview)
2.  [Key Features Detailed](#-key-features)
3.  [Detailed File Structure](#-detailed-file-structure)
4.  [Core Components Breakdown](#-core-components-breakdown)
5.  [Memory & Database Data Models](#-memory--database-data-models)
6.  [Backend API Route Node Mappings](#-backend-api-route-node-mappings)
7.  [Environment Variable Configuration Schema](#-environment-variable-configuration)
8.  [Startup Setup](#-startup-setup)

---

## 🌟 Overview
CodeRefine streamlines visual diagnostics by simulating an Agent framework setup. Users input commands referencing variables or refactorings in current workspace frames. The backend streams conversational context via background executors that assess knowledge buffers (`vectorStore`), analyze diff impacts client-side via Framer, and continuously update action states in incremental step loaders.

---

## 🚀 Key Features

### 💻 1. Interactive Core Workspace
*   **Integrated Monaco Editor**: Side-by-side IDE supporting standard layout adjustments with highlighted visual patches.
*   **Diff Trackers Overlay**: Maps differential states allowing continuous inspections overlayed safely inline.
*   **Artifacts View Sub-Frames**: Render outputs explicitly framed detailing execution buffers synced continuously.

### 👁️ 2. Visual Layer Attention Monitoring (`GridScan`)
*   **Reactive Post-Processing WebGL Shader Grid**: Operates standard rendering pipelines syncing interactive scales directly to face movement increments.
*   **Real-Time `face-api.js` Diagnostics Frame**: Estimates pitch/yaw benchmarks client-side leveraging modular posture checks designed explicitly supporting proctoring analytics dashboards.

---

## 📂 Detailed File Structure

Exhaustive file trees detailing continuous structural triggers:

```text
├── app/                        # Next.js Page & Action Nodes
│   ├── actions/                # Background operations executed Server-Side
│   │   ├── chat.ts             # Conversational context handler logic streams prompts updates
│   │   ├── analyze.ts          # Evaluates intent, queries knowledge snippet buffers
│   │   └── execute.ts          # Integrates online compiler API callbacks if present
│   ├── api/                    # Core Sub-Routing Handles
│   │   ├── auth/               # Provider login callbacks & session management
│   │   ├── chat/               # Continuous response streaming buffers 
│   │   ├── reports/            # Analytics logs and PDF exports 
│   │   ├── stripe/             # Webhook sync routines & subscription handlers
│   │   ├── tools/              # Visual and diagnostic tool endpoints
│   │   ├── user/               # Usage usage quotas and tier limit tracking
│   │   └── workspaces/         # Worktree indices and file structure retrieval
│   ├── app/                    # Primary Editor Workspace page interface
│   ├── dashboard/              # Grid lists of workspaces and dashboard utilities
│   └── favicon.ico              # Page visual header asset
│
├── components/                 # Structural React Components frames logic sync setups
│   ├── ArtifactsView.tsx        # Action artifact lists containers setups streams continuity layouts 
│   ├── ChatPanel.tsx            # Continuous conversational thread container & bubbles
│   ├── CodeEditor.tsx          # Monaco Editor setup backing inline decor revisions
│   ├── DashboardShell.tsx       # Structural layout shell for grids and modules
│   ├── DiffViewer.tsx           # Inline line-by-line differential code comparison
│   ├── FileExplorer.tsx         # Sidebar component supporting relative file trees
│   ├── GridScan.tsx             # 3D interactive WebGL post-processing shader visuals
│   └── TaskProgress.tsx         # Background agent pipeline state loader and logs
│
└── lib/                        # Operational connectors and operation structures
    ├── auth.ts                 # NextAuth configs setup for OAuth callbacks
    ├── chatStore.ts            # Client session index caching for continuity
    ├── rateLimit.ts            # Upstash middleware middleware governing query loads
    ├── vectorStore.ts          # Knowledge snippet indexing and semantic filtering
    └── models/                 # Database Document templates schemas
        ├── User.ts             # Account flags, profile tracking, subscription indices
        ├── Workspace.ts         # Worktree logs including file structure indices metadata
        └── AnalysisReport.ts    # Agent diagnostic outcomes diagnostic tallies records
```

---

## 🔌 Core Components Breakdown

*   **`GridScan.tsx`**: Loads standard face tracking weights using CDN libraries for ambient procedural attention visualization. Updates Shader tilt buffers securely.
*   **`chatStore.ts`**: Handles client session indices natively syncing context continuous buffers in memory layouts natively mapped successfully.
*   **`vectorStore.ts`**: Provides diagnostic continuous continuous semantic match mapping setups native match models lookup thresholds setup natively setups structures.

---

## 🔌 Backend API Route Node Mappings

*   `/api/chat/stream`: POST routines streaming diagnostics Continuous buffered streams analytics execution frames pipelines configurations.
*   `/api/workspaces`: Operational files retrieves setup routing indexing structure setup setup structure structures setup.
*   `/api/stripe/checkout`: Routes workflows sub-framed Subscription routing initializations formats.
-   `/api/stripe/webhook`: Continuous webhook sync layout callbacks layout updates models pricing updates routers trigger setup.

---

## ⚙️ Environment Variable Configuration

Create a `.env.local` containing correct setup buffers:

```env
# AI APIs
GEMINI_API_KEY=your_key

# Database setups
MONGODB_URI=your_conn_string
UPSTASH_REDIS_REST_URL=redis_url
UPSTASH_REDIS_REST_TOKEN=redis_token

# Provider setup
GOOGLE_CLIENT_ID=id
GOOGLE_CLIENT_SECRET=secret
NEXTAUTH_SECRET=auth_secret

# Pricing Setup Framework
STRIPE_SECRET_KEY=key
STRIPE_PRO_PRICE_ID=id
STRIPE_TEAM_PRICE_ID=id
```

---

## 🏃 Startup Setup

1. install tools dependencies: `npm install`
2. Run startup triggers setups routines continuous: `npm run dev`
