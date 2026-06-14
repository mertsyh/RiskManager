# Deploy Guide

Step-by-step instructions for setting up and publishing the project from scratch.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- Git
- GitHub account
- (Optional) [Supabase](https://supabase.com/) account — required for the leaderboard and session logs

---

## 1. Fork and Clone

Fork this repo on GitHub, then clone it to your machine:

```bash
git clone https://github.com/YOUR_USERNAME/RiskManager.git
cd RiskManager
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Set the Vite Base URL

In `vite.config.js`, set `base` to match your repository name:

```js
base: '/YOUR_REPO_NAME/'
```

Example: if your repo is named `RiskManager`, keep it as `base: '/RiskManager/'`.

---

## 4. Supabase Setup (Optional)

Supabase is needed for the leaderboard and session logs. You can skip this step — the game runs fully offline without it.

### 4a. Create a Project

Create a new project at [supabase.com](https://supabase.com/).

### 4b. Run the Database Schema

In the Supabase dashboard, go to the **SQL Editor** tab. Paste the contents of `supabase/schema.sql` and run it.

This creates two tables:
- `gpaf_events` — in-game event logs
- `leaderboard` — player scores

### 4c. Get Your API Keys

In the Supabase dashboard, go to **Project Settings → API**:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public key** → `VITE_SUPABASE_ANON_KEY`

### 4d. Create a `.env` File

Copy the example file and fill in your own values:

```bash
cp .env.example .env
```

Then open `.env` and replace the placeholders with your Supabase project URL and anon key.

> `.env` is listed in `.gitignore` and will not be committed.

---

## 5. Local Development

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 6. Deploy to GitHub Pages

### 6a. Enable GitHub Pages

In your GitHub repo, go to **Settings → Pages**.  
Set the **Source** to the `gh-pages` branch.

### 6b. Run the Deploy Command

```bash
npm run deploy
```

This command does two things in sequence:
1. `npm run build` — builds the production bundle into `dist/`
2. `gh-pages -d dist` — pushes `dist/` to the `gh-pages` branch

Within a few minutes the game will be live at:

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

---

## Quick Reference

| Step | Command |
|------|---------|
| Install dependencies | `npm install` |
| Development server | `npm run dev` |
| Production build | `npm run build` |
| Deploy to GitHub Pages | `npm run deploy` |
