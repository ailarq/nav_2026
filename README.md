# Navarathiri Golu 2026 - Panchabootham

Plain HTML, CSS and JavaScript. No build step.

## Run locally
Browsers block `fetch` on `file://`, so use a tiny server:

    python3 -m http.server 8000

then open http://localhost:8000

## Deploy
Push to GitHub, then in Netlify choose "Import from Git". The repository configuration
stages the static files in `public` using `node scripts/prepare-site.cjs` and publishes
that directory. No Hugo build is required. Every push redeploys.

## Settings - `config.json`
| Key | Meaning |
|---|---|
| `showGallery` | `true` / `false` - show or hide the Past Golu Gallery |
| `defaultLanguage` | `en`, `ta`, `te`, `kn`, `hi` |
| `music` | path to the divine music file (put it in `audio/`) |
| `musicVolume` | 0 to 1 |

## Add or change pictures, stories, videos
Everything lives in `data/content.json`.

* Drop the picture in `images/<element>/` (or anywhere, e.g. `images/common/`).
* Add an entry to that element's `items`:

      { "type": "image", "src": "images/fire/3.jpg",
        "title": { "en": "...", "ta": "...", "te": "...", "kn": "...", "hi": "..." },
        "story": { "en": "...", "ta": "...", "te": "...", "kn": "...", "hi": "..." } }

* Video: `{ "type": "video", "src": "videos/clip.mp4", "title": {...}, "story": {...} }`
  or YouTube: `{ "type": "youtube", "id": "VIDEO_ID", "title": {...}, "story": {...} }`
* Gallery: add photos under `gallery.years[].items` as `{ "src": "images/gallery/2025/4.jpg" }`
  (optional `"caption": { "en": "..." }`). Add a new year as a new entry.
* A missing language falls back to English.

## Music
Add a royalty-free / licensed track as `audio/divine.mp3`. Browsers don't allow sound before the
visitor taps, so it starts on the first tap (the language buttons or Enter). The round button
bottom-right mutes it on every page, and the choice is remembered.

## Photos and thumbnails
Photos are tall phone shots. Each one has a small copy in `thumbs/` next to it
(e.g. `images/fire/fire-02.jpg` and `images/fire/thumbs/fire-02.jpg`) for the strip under the picture.
If a thumbnail is missing the full photo is used instead, so adding a photo without one still works.
The original files in `golu_images/` are not used by the site and are excluded by `.gitignore`.
