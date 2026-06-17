# ScoreClash ⚽

FIFA World Cup 2026 Prediction League App

## Deployment Guide

### Step 1 — Set up Firestore security rules

1. Go to [Firebase Console](https://console.firebase.google.com) → your project
2. Click **Firestore Database** → **Rules** tab
3. Replace everything with the contents of `firestore.rules` in this folder
4. Click **Publish**

### Step 2 — Deploy to Vercel

**Option A — Via GitHub (recommended)**

1. Create a free account at [github.com](https://github.com) if you don't have one
2. Create a new repository called `scoreclash`
3. Upload all files from this folder to the repository
4. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
5. Click **Add New Project** → select your `scoreclash` repository
6. Vercel auto-detects Vite — just click **Deploy**
7. In ~2 minutes you'll have a live URL like `https://scoreclash.vercel.app`

**Option B — Via Vercel CLI**

```bash
npm install -g vercel
cd scoreclash-app
npm install
vercel
```

Follow the prompts — it will give you a live URL immediately.

### Step 3 — Test it

1. Open your live URL on two different devices
2. Register two accounts
3. Create a league on one device, join it on the other using the code
4. Enter a prediction — it should appear instantly on the other device

### Optional — Custom domain

In Vercel dashboard → your project → **Settings** → **Domains**
Add your domain (e.g. `scoreclash.com`) and follow the DNS instructions.

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Tech stack

- React 18 + Vite
- Firebase Firestore (real-time database)
- No other dependencies
