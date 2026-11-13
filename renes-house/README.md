# René's House

Mobile-first renovation visualization prototype. Choose or take a photo, describe changes, and receive an edited image in the local gallery. The gallery is stored in IndexedDB **on this device only** (not synced across devices).

## Hosting

Publish the repository via GitHub Pages (Settings → Pages → Deploy from main/root). App path: `/renes-house/`. Publishing requires Pages to be enabled by a repository admin.

## Backend contract

The frontend requires an image-editing backend. In Setup enter an HTTPS endpoint that accepts `multipart/form-data` POST fields `image` (file) and `prompt` (text). Return image bytes with `Content-Type: image/png` or JSON `{\"image\":\"https://...\"}` (or data URL). Configure CORS for the GitHub Pages origin. Store image-generation API keys **only on the backend**. For a private family demo, protect the backend from abuse (e.g. per-device token, quotas/rate limits), without exposing a provider key in frontend code.

This repository currently contains **only the frontend**; no actual AI image generation occurs until a backend is connected. Photos are stored in the browser's IndexedDB and may be lost if browser data is cleared. The UI does not provide cloud gallery sync.
