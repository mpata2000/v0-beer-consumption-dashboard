# Birras - Campeonato de Birras by Wet Bandits

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/mpata2000-7833s-projects/v0-beer-consumption-dashboard)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/xELU7f5hQ6q)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/mpata2000-7833s-projects/v0-beer-consumption-dashboard](https://vercel.com/mpata2000-7833s-projects/v0-beer-consumption-dashboard)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/projects/xELU7f5hQ6q](https://v0.app/chat/projects/xELU7f5hQ6q)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local Setup

1) Install dependencies
\`\`\`bash
pnpm install
\`\`\`

2) Environment variables (`.env.local`)
\`\`\`bash
GOOGLE_SHEETS_API_KEY=your-api-key
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id
GOOGLE_SHEETS_RANGE=Sheet1!A1:L10000
\`\`\`

3) Run the app
\`\`\`bash
pnpm dev
\`\`\`

## Data Model and Members
- Data is fetched from Google Sheets and normalized in `lib/beer-entry.ts`.
- Aggregations live in `lib/dashboard-model.ts`.
- Update display aliases in `lib/members.ts` (email -> alias).

## Loading UX
- Route-level loading screen: `app/loading.tsx`.
- Shared skeleton component: `components/ui/skeleton.tsx`.

## Type Safety
- Shared types in `lib/types.ts`.
- Build enforces TypeScript and ESLint.
