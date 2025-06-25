# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Local Backend

The project now includes a simple Express server for handling photo uploads.

1. Install dependencies (requires network access):
   ```bash
   npm install
   ```
2. Start the upload server:
   ```bash
   npm run server
   ```
   The server uses CORS so it can accept requests from the Vite dev server.
3. In a separate terminal start the Vite dev server:
   ```bash
   npm run dev
   ```

Uploaded files will be stored in the `uploads/` directory and served from `/uploads/*`.
When running `npm run dev` the Vite dev server proxies API and uploads requests to the backend so the app can simply call `/api/upload`.
If uploads fail with a "Failed to fetch" error, ensure the backend is running by executing `npm run server` in another terminal.
