# Deployment Checklist

## Frontend

- Set `VITE_API_URL` to your public backend URL, for example `https://idfs.onrender.com/api/v1`
- Set `VITE_GOOGLE_CLIENT_ID` to the same Google OAuth client ID used by the backend
- If you deploy on Vercel, keep [frontend/vercel.json](d:/Projects/IDFS/frontend/vercel.json) so routes like `/login` rewrite to `index.html`

## Backend

- Set `GOOGLE_CLIENT_ID` to the same Google OAuth client ID used by the frontend
- Set `BACKEND_CORS_ORIGINS` to include your deployed frontend origin, for example `["https://your-frontend-domain.vercel.app"]`
- Confirm your backend is reachable at the exact URL used in `VITE_API_URL`

## Google Cloud Console

- Add your deployed frontend origin to Authorized JavaScript origins
- Make sure the client ID matches the one used in both frontend and backend env vars

## Quick Checks

- If the browser tries to call `localhost:5000` or `localhost:8000`, the frontend was built with the wrong `VITE_API_URL`
- If `/login` returns `404` on refresh or direct open, your frontend host needs SPA rewrites
- If Google returns a credential but the backend call fails in the browser, check CORS and client ID alignment first
