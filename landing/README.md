# SecretlustAI landing page

Landing page for **SecretlustAI.com** – adult AI video generator. Structure based on SugarGenBox; colors and branding are distinct (rose/crimson theme).

## Stack

- **Hosting:** Netlify or Hostinger (static: upload `index.html`, `styles.css`, `main.js`).
- **Landing page videos:** Cloudflare R2 (or any CDN). Replace the `.preview-placeholder` divs in the hero with `<video>` or `<img>` pointing to your R2 public URLs.
- **Backend / auth / DB:** Supabase (auth, user data, credits, etc.).

## Access the admin panel (add videos / R2 URLs)

**Option A – On your computer (before or without deploy):**
1. Open Terminal (Mac) or Command Prompt (Windows).
2. Go to the landing folder:  
   `cd /Users/themaf/secretlust/landing`
3. Start a local server:  
   `python3 -m http.server 5000`
4. In your browser open:  
   **http://localhost:5000/admin.html**

**Option B – After you deploy to Netlify:**  
Open: **https://your-site-name.netlify.app/admin.html**

In the admin: click **Add video**, paste your R2 video URL and (optional) thumbnail URL, then Save. Use **Export videos.js** to download the list if you want to keep it in the repo.

## Using R2 for hero videos

1. Upload your landing preview videos to an R2 bucket and make them publicly readable (or use signed URLs).
2. In `index.html`, replace each hero preview card with something like:

```html
<div class="preview-card">
  <video autoplay muted loop playsinline>
    <source src="https://your-r2-public-url.com/hero-1.mp4" type="video/mp4">
  </video>
</div>
```

Add to `styles.css` if needed:

```css
.preview-card video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## Deploy to Netlify

- Drag-and-drop the `landing` folder to [Netlify](https://app.netlify.com/drop), or
- Connect the repo and set publish directory to `landing` (or root if this is the only content).

## Deploy to Hostinger

- Upload `index.html`, `styles.css`, and `main.js` via File Manager or FTP to your site’s `public_html` (or the folder that serves the domain).
