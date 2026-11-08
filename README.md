# User Registration (Experiment 10)

A registration form (name, email, phone, gender, DOB, course, address) that shows
the list of registered users after submitting.

It works in two modes using the **same frontend**:

| Mode | Where | Data is stored in |
|------|-------|-------------------|
| Demo (static) | GitHub Pages | The visitor's browser (`localStorage`) |
| Full | `npm start` / any Node host | MongoDB |

## Deploy on GitHub Pages (no 404s)

1. Create a GitHub repo and push this folder to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. In the repo go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. The workflow in `.github/workflows/pages.yml` runs on every push. When it finishes, the site is at
   `https://<you>.github.io/<repo>/`.

Why it no longer 404s: all asset links are relative (`style.css`, not `/style.css`), `index.html`
is at the repo root, and form submission is handled in the browser, so there is no `/server`
route that GitHub Pages cannot serve.

## Run locally with MongoDB

```bash
npm install
npm start            # http://localhost:3000
```

Environment variables (all optional): `PORT` (3000), `MONGO_URL` (`mongodb://127.0.0.1:27017`), `DB_NAME` (`RegistrationDB`).

The server serves the same files and overrides `/config.js` so the form posts to `/api/register`.

## Use the Pages site with a hosted backend (optional)

Host `server/` on Render/Railway/etc. with a MongoDB Atlas `MONGO_URL`, then set in `config.js`:

```js
window.APP_CONFIG = { apiUrl: "https://your-backend.example.com/api/register" };
```

(You would also need to add CORS to `server/index.js`.)

## Structure

```
index.html  style.css  script.js  config.js  404.html   <- static site
server/index.js                                         <- Express + MongoDB API
.github/workflows/pages.yml                             <- Pages deployment
```
