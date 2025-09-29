# QuickBooks Invoice Card (HubSpot)

This repository contains a HubSpot private app that adds a CRM card to HubSpot deals, enabling QuickBooks integration for creating invoices and viewing a user's invoice list.

Contents

- `src/app/extensions/InvoiceCard.jsx` - Main CRM card UI component. Provides QuickBooks connection flow, contact selection, and invoice creation.
- `src/app/extensions/InvoiceList.jsx` - UI component that displays invoices for a specific user/deal.
- `src/app/app.functions/` - Serverless functions used by the UI components:
  - `checkConnection.js` - Checks if the current user is connected to QuickBooks via backend API.
  - `getContacts.js` - Retrieves contacts associated with a deal from your backend.
  - `createInvoice.js` - Requests invoice creation via backend API.
  - `getInvoiceList.js` - Retrieves list of invoices for a given deal and user.
  - `package.json` - dependencies for serverless functions.
- `hsproject.json`, `hubspot.config.yml` - HubSpot project configuration.
- `.github/workflows/deploy-hubspot-frontend.yml` - CI workflow to upload the HubSpot project using the HubSpot CLI.

Summary of how it works

1. The HubSpot CRM card (`InvoiceCard.jsx`) runs in the HubSpot UI and calls serverless functions (HubSpot Functions) via `hubspot.serverless(...)`.

2. Serverless functions act as pass-throughs to your backend API. They require two secrets: `BACKEND_API_URL` and `BACKEND_API_KEY`.

3. The backend (not included) is expected to implement several endpoints (examples):

## Backend endpoints (examples)

- `GET /quickbooks/checkConnection?userId=<userId>` - returns connection status and optional `authUrl` for OAuth.

- `GET /hubspot/associated-contacts/<dealId>` - returns contacts associated with a HubSpot deal.

- `POST /invoice/create-invoice?userId=<userId>&dealId=<dealId>&contactId=<contactId>` - creates an invoice and returns `{ invoiceNumber, invoiceUrl }`.

- `GET /invoice/deals/<dealId>?&userId=<userId>` - returns an array of invoices for the deal and user.

4. The UI components use the HubSpot UI Extensions library (`@hubspot/ui-extensions`) for consistent styling.

Environment and Secrets (required)

- `HUBSPOT_PERSONAL_ACCESS_KEY` (used in CI for hs CLI; your portal uses `hubspot.config.yml` too)

- `HUBSPOT_ACCOUNT_ID` (used in CI)

- `BACKEND_API_URL` - Base URL to your backend API (e.g., `https://api.example.com`)

- `BACKEND_API_KEY` - API key required by your backend (passed as `x-api-key` header)

Serverless function configuration

- The functions are declared in `src/app/app.functions/serverless.json` and require the above secrets. When deployed, HubSpot will inject those from project secrets.

Local Development

1. Install dependencies for extension UI (from `src/app/extensions`):

```powershell
cd src/app/extensions
npm install
npm run dev
```

Note: `npm run dev` uses `hs project dev` and requires the HubSpot CLI and `hubspot.config.yml` configured locally.

2. Testing serverless functions locally

- These functions are light wrappers that call your backend. You can run unit tests or use a small node script to call them directly. Example quick test using node:

```powershell
node -e "const f = require('./src/app/app.functions/getInvoiceList'); f.main({parameters:{dealId:'123', userId:'user-1'}}).then(console.log).catch(console.error)"
```

Replace paths and args as needed. Ensure `BACKEND_API_URL` and `BACKEND_API_KEY` are set in your environment when testing.

Deployment

- The included GitHub Actions workflow (`.github/workflows/deploy-hubspot-frontend.yml`) uses the HubSpot CLI to upload the project. It expects these GitHub secrets: `BACKEND_API_URL`, `BACKEND_API_KEY`, `HUBSPOT_ACCOUNT_ID`, `HUBSPOT_PERSONAL_ACCESS_KEY`.

Troubleshooting

- OAuth redirect errors (QuickBooks) often mean client credentials or redirect URI mismatch. Validate the redirect URI configured in QuickBooks developer console matches the callback the backend uses.

- `hs project upload` may fail if the target HubSpot project is linked to another GitHub repository; either use a unique project name (`hsproject.json`) or unlink the existing project in HubSpot portal settings.

Next steps / Improvements

- Add unit tests for serverless functions (jest/mocha)

- Harden error handling and return consistent API shapes from functions

- Add CI linting and type checks

- Provide a small mock backend for local end-to-end testing

License

- MIT (see `LICENSE.md`)
