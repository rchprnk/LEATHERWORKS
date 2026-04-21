# Prime Leather Repair API

Backend API for `primeleatherrepair.com`.

## Local run

1. Copy `.env.example` to `.env`
2. Install dependencies:
   `npm install`
3. Start the server:
   `npm run dev`

Default local URL: `http://localhost:5002`

## Required environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLIENT_ORIGIN`

Optional:

- `PORT`
- `CONTACTS_TABLE` (defaults to `contacts`)
- `CORS_ORIGIN` (fallback if `CLIENT_ORIGIN` is not set)

## Hostinger deploy

Use a separate repository that contains only the `server` folder contents:

- `package.json`
- `package-lock.json`
- `src/`
- `.gitignore`
- `README.md`

In Hostinger Node.js settings:

1. Create a Node.js app for `api.primeleatherrepair.com`
2. Connect the new GitHub repository
3. Set the start command to `npm start`
4. Add environment variables from `.env.example`
5. Set `CLIENT_ORIGIN=https://primeleatherrepair.com`

Do not hardcode the port. Hostinger provides `PORT` automatically.
