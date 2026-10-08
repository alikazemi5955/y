<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ad862811-4856-4c46-86ff-976f652efc56

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Production security notes

- Administrative APIs require a real persisted admin session token. Legacy `x-sync-client: puzzle-bridge` and magic admin tokens are not trusted.
- Supplier credentials are stripped from public supplier/status responses.
- Virtual employees and supplier synchronization endpoints require the admin role.
- Set `ADMIN_RESET_PASSWORD` only for a one-time recovery, then remove it from the environment.
- Do not commit `.env`, session files, or real supplier credentials.
- Production serves the Vite `dist/` app while keeping `/legacy/*` as a compatibility runtime for the current UI.

## First production startup

1. Copy `.env.example` to `.env`.
2. Set a long, unique `ADMIN_RESET_PASSWORD` (at least 16 characters).
3. Start the server once so the admin password is hashed into `data/users.json`.
4. Remove `ADMIN_RESET_PASSWORD` from `.env` and restart the server.
5. Change the admin username/password from the admin panel after first login.

The packaged data intentionally contains no working default admin password and no personal customer record.
