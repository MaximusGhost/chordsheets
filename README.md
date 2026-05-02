# ♫ ChordSheets

Personal digital fake book — a PWA for storing, organizing, and viewing annotated chord sheet PDFs.

## Features

- **Upload** annotated chord sheet PDFs with metadata (title, artist, tags, key, notes)
- **Browse** your library with search, tag filtering, and sorting
- **View** PDFs full-screen on your phone with pinch-to-zoom
- **Tags** with autocomplete and inline creation
- **PWA** — installable, works offline for previously viewed songs
- **Dark theme** — easy on the eyes, great for stage/dim lighting

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, react-pdf
- **Backend**: Azure Functions v4 (Node.js + TypeScript)
- **Database**: Azure Cosmos DB (NoSQL)
- **Storage**: Azure Blob Storage
- **Hosting**: Azure Static Web App

## Development

### Prerequisites

- Node.js 18+
- Azure Functions Core Tools (for local API development)

### Setup

```bash
# Install frontend dependencies
npm install

# Install API dependencies
cd api && npm install && cd ..

# Copy environment template
cp .env.example .env
# Fill in your Azure credentials in .env
```

### Run locally

```bash
# Start frontend dev server (port 5173)
npm run dev

# In a separate terminal, start API (port 7071)
cd api && npm start
```

The Vite dev server proxies `/api/*` requests to the Azure Functions runtime.

### Build

```bash
npm run build        # Build frontend
cd api && npm run build  # Build API
```

## Deployment

1. Create Azure resources:
   - Resource Group: `chordsheets-rg`
   - Azure Static Web App: `chordsheets-app` (Free tier)
   - Azure Cosmos DB Account (Free tier, NoSQL API)
   - Azure Storage Account (Hot tier)

2. Set up Cosmos DB:
   - Create database: `chordsheets`
   - Create container: `songs` with partition key `/id`

3. Set up Blob Storage:
   - Create container: `pdfs` (private access)

4. Configure Azure Static Web App application settings with your Cosmos DB and Blob Storage credentials (see `.env.example`)

5. Add `AZURE_STATIC_WEB_APPS_API_TOKEN` to GitHub repository secrets

6. Push to `main` branch — GitHub Actions will deploy automatically

## Cost

~$0.10/month for personal use (hundreds to thousands of songs).
