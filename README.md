# Customer Stories Accordion (Supabase-style)

A single-page recreation of the "How industry leaders are building with Supabase"
accordion section from supabase.com — 5 rows that expand on click to reveal a
quote, headline, person, and link. Pure HTML/CSS/JS, no build step.

## Files

- `index.html` — page structure and content
- `styles.css` — dark theme + accordion styling/animation
- `script.js` — click-to-expand/collapse behavior

## Run locally

Just open `index.html` in a browser, or serve it:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

1. Create a new GitHub repo and push these files to the `main` branch:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```

2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
4. Choose branch `main` and folder `/ (root)`, then **Save**.
5. Your site will be live at:
   `https://<your-username>.github.io/<repo-name>/`

## Customize

- Edit the text/company data directly in `index.html` (each `.card` block).
- Colors and spacing live in `styles.css` under `:root` and the `.logo--*` classes.
- Accordion logic (single-open behavior) is in `script.js` — remove the
  "close all others" line if you want multiple cards open at once.
