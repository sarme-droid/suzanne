# Deploying Suzanne

Architecture: **Vercel** (React/Vite frontend) → rewrites `/api/*` → **Render** (Express API) → **Aiven** (MySQL). Code lives on **GitHub**.

## 1. Aiven (MySQL)
1. Create a MySQL service (free plan is fine). Wait until it is *Running*.
2. Copy Host, Port, User (`avnadmin`), Password, Database (`defaultdb`) from the service overview. Download the CA certificate (optional, for strict TLS).
3. Under *Allowed IP addresses*, allow `0.0.0.0/0` (Render free has no static IP).
4. Create the tables (no existing database needed): put the Aiven values in `back/.env`, set `DB_SSL=true`, then run `cd back && npm install && node scripts/initDb.js`.
5. Create the first admin: `node scripts/createUser.js admin <password> admin "Admin"`.

## 2. GitHub
```
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<you>/suzanne.git
git push -u origin main
```
`.env` is git-ignored. **Never commit it.** Rotate any secret that was ever shared.

## 3. Render (API)
New → *Blueprint* (uses `render.yaml`) or *Web Service*: root dir `back`, build `npm install`, start `npm start`.
Env vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (from Aiven), `DB_SSL=true`, `JWT_SECRET` (long random), `CORS_ORIGIN` (Vercel URL, set after step 4).
Check `https://<service>.onrender.com/` returns the "API is running" JSON. Free instances sleep when idle (first request is slow).

## 4. Vercel (frontend)
Import the repo → Root Directory `front`, framework Vite (build `npm run build`, output `dist`).
Edit `front/vercel.json` and replace `YOUR-RENDER-SERVICE` with your Render hostname, commit and push. No frontend env vars needed. The rewrite proxies `/api` to Render, so the code is unchanged.
Then set `CORS_ORIGIN` on Render to your Vercel URL and redeploy.

## Local dev
Unchanged: `cd back && npm start` and `cd front && npm run dev`.
