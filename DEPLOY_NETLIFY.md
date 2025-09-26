# Deploying TrackWise with GitHub + Netlify (frontend) and a Node host (backend)

This repository is prepared for split hosting:
- Netlify hosts the static frontend from /public
- A Node host (Render, Railway, Fly.io, or Vercel) runs the Express backend (server.js)

Prerequisites
- A GitHub account
- A Netlify account
- A Node hosting account (Render/Railway/Fly/Vercel)

1) Push the repo to GitHub
- Create a new repository on GitHub (e.g., trackwise)
- In PowerShell from the project root:
  git init
  git branch -M main
  git remote add origin https://github.com/<your-username>/trackwise.git
  git add .
  git commit -m "Prepare Netlify + backend deployment"
  git push -u origin main

2) Deploy the backend (Express) to a Node host
- Render example:
  - Create New -> Web Service
  - Connect your GitHub repo
  - Environment: Node 18+
  - Build Command: (leave empty)
  - Start Command: node server.js
  - Add environment variables from .env.production.example
  - Deploy and note the URL, e.g., https://trackwise.onrender.com

3) Configure Netlify (frontend)
- In Netlify Dashboard: Add new site -> Import an existing project -> GitHub -> choose your repo
- Build settings:
  - Build command: (leave empty) or npm run netlify-build
  - Publish directory: public
- Environment (optional): none required since we proxy /api
- Deploy the site and note the Netlify URL, e.g., https://trackwise.netlify.app

4) Wire the proxy
- Edit netlify.toml and public/_redirects, replace https://your-backend.example.com with your backend URL
- Commit and push changes; Netlify will redeploy automatically

5) Verify
- Visit your Netlify site; the landing page is public/index.html
- Click "Launch Application" to open your backend app
- API calls to /api/* on Netlify will be proxied to your backend /api/*

Notes
- EJS views and Socket.IO run on the backend host, not on Netlify
- If you later build a SPA, you can add SPA rewrites to netlify.toml
- Do not commit real secrets; keep them in your backend host environment settings
