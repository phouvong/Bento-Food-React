# Environment Variables Guide

This app reads its config from two files:

- **`.env.development`** — used when running `npm run dev`
- **`.env.production`** — used when running `npm run build` / deploying live

Before going live, open **`.env.production`** and replace the demo values
below with your own credentials.

## What to update

| Variable | What it is | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | Your backend/API URL | Your backend server's URL |
| `NEXT_CLIENT_HOST_URL` | This website's own live URL | Your domain |
| `NEXT_PUBLIC_GOOGLE_MAP_KEY` | Google Maps key | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase config | [Firebase Console](https://console.firebase.google.com/) → Project settings → General → Your apps |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase config | same as above |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase config | same as above |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase config | same as above |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase config | same as above |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase config | same as above |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase config (optional) | same as above |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | For push notifications | Firebase Console → Project settings → Cloud Messaging → Web Push certificates |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | "Sign in with Google" | [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → OAuth Client ID |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | "Sign in with Facebook" | [Facebook Developers](https://developers.facebook.com/apps/) → your app → Settings → Basic |

## Important

- Use your own Firebase project — don't keep the demo one this codebase ships with.
- Do the same for the Google Maps key, Google Client ID, and Facebook App ID — create your own instead of reusing the demo ones.
- Update both `.env.development` and `.env.production` with matching values for your project.
