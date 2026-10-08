# Movie Night Matcher — live TMDB version

## Start here

1. Install Node.js 22 or newer from https://nodejs.org/ (use a current LTS release).
2. Extract this ZIP. In VS Code, open the `movie-night-matcher-tmdb` folder containing `server.mjs`.
3. Make a copy of `.env.example` and rename the copy to `.env`.
4. Open `.env` and replace `PASTE_YOUR_API_READ_ACCESS_TOKEN_HERE` with your TMDB **API Read Access Token**, on the same line after `=`. Do not add the word `Bearer`. You can leave the API-key placeholder alone. Alternatively, put your v3 API key in `TMDB_API_KEY` and leave the token placeholder alone. If both are provided, the token is used.
5. Open Terminal → New Terminal in VS Code and run:

```bash
npm start
```

6. Open **http://localhost:3000** in your browser.

No `npm install` is needed: the server uses Node's built-in modules. You can also run `node server.mjs` instead of `npm start`.

**Use this Node server instead of Live Server for this version.** Live Server does not provide the `/api/` routes. Keep the terminal running while using the app. Press Ctrl+C to stop. Restart it whenever you edit `.env` or `server.mjs`; refresh the browser after frontend edits.

## Folder guide

- `.env.example`: credential template. Copy to `.env`, never put credentials in browser files.
- `.gitignore`: keeps `.env` out of new Git commits. If you previously committed credentials, remove and rotate them.
- `server.mjs`: serves the interface and forwards allowlisted requests to TMDB. It binds to localhost and keeps credentials on the server.
- `public/index.html`: markup and page text.
- `public/styles.css`: colours, layout and mobile styling.
- `public/app.js`: movie fetching, filters, rendering, keyword matching and watchlist.
- `public/manifest.json`, `public/sw.js`, icons: installable web-app support.

## Features

- Live paginated movie discovery, ratings, genres, posters and details.
- Genre filters match any selected genre. Discovery requires at least 100 votes to make rating sorting more useful. Change `params['vote_count.gte']='100'` in app.js if desired.
- Cast search: type a name, then choose the correct person from the dropdown. The ID is sent to TMDB, avoiding confusion between people with similar names.
- Title search: searches movie titles. Other preferences are applied to each loaded result page. Press Load more if a page has no matches. Sorting in title-search mode applies to loaded results only.
- Runtime: unknown runtimes are excluded when a runtime limit is selected.
- Book adaptations: uses TMDB source-material keywords. Tags are incomplete; the “without tags” option is not proof of an original screenplay. Exact book title/author search is not provided.
- Description matching: a small genre heuristic retrieves candidates, then words in titles, descriptions, genres and keywords rank matching movies. It is not AI and does not reliably understand negation. Use explicit filters for precise choices. If no genre is recognised, it checks highest-rated candidates; it is not an exhaustive full-catalogue semantic search.
- Watchlist/preferences are saved on this browser/device. New live-data watchlist storage is separate from the old demo watchlist.
- Loading, retry/error messages, request cancellation and escaped movie text.

## API flow

The browser calls `/api/discover/movie`, `/api/search/movie`, `/api/search/person`, `/api/search/keyword`, `/api/genre/movie/list`, and `/api/movie/{id}` on this server. The server adds your credential and calls TMDB. Movie details include `credits,keywords`, and are cached in browser memory. Four movie-detail requests run at a time per result page.

## Troubleshooting

- “Add your TMDB token…”: check the filename is `.env`, not `.env.txt`; replace the placeholder and restart.
- “TMDB rejected your credentials”: verify the correct token/key was pasted with no extra text; restart.
- “Could not reach TMDB”: check internet access and retry.
- Port already in use: change `PORT=3000` to `PORT=3001`, restart and open http://localhost:3001.
- Stale design: developer tools → Application → Service Workers → Unregister, then refresh.
- A movie has no poster/runtime: those fields can be missing in TMDB.

## Mobile and deployment

This remains a responsive PWA, not a native Android/iOS project. The localhost server is only accessible on this computer. Production needs a Node-compatible host (or adapting the proxy to serverless functions), HTTPS, server-side environment variables, and appropriate public-server controls/rate limits. Uploading only `public/` to static hosting will not provide the API proxy.

Before public release, review TMDB terms and add an approved TMDB logo as required by its attribution guidance. The required endorsement disclaimer and a TMDB link are included in the footer. See https://developer.themoviedb.org/docs/faq.

## Validation

JavaScript syntax and mock-based server/frontend checks were completed. No real credential was supplied, so authenticated live TMDB requests and visual browser behaviour have not been verified. Insert your credential and run locally to complete that check.
