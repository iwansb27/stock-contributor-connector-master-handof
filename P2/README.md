# P2 — Stock Contributor Connector (Independent)

Target: GitHub + GitHub Pages, with no mandatory Floot/Replit/Netlify/Vercel/Supabase dependency.

## Current implementation
- Static mobile-friendly workflow.
- Image selection and preview.
- Local Job ID.
- Metadata workspace: Title, Description, Keywords.
- Copy Title / Copy Description / Copy All Keywords.
- Shutterstock category remains manual.
- Direct Shutterstock Contributor shortcut.
- No automatic metadata transfer.
- No automatic final submit.
- No client-side secrets.
- FTPS image transfer is deliberately NOT claimed as working in static-only P2.

## Important
The current repository is a handoff repository. The historical Floot engine is not accessible in the current account context, so its transfer implementation cannot be copied safely without source evidence.

## GitHub Pages
The workflow is ready, but GitHub Pages eligibility/source configuration depends on the repository/account plan. For a private GitHub Free repository, Pages availability may be restricted. If eligible, set Settings → Pages → Build and deployment → Source → GitHub Actions.

## Next technical gate
Before adding any backend or external service, audit whether the previously successful image-transfer implementation can be recovered independently. Do not invent or expose FTPS credentials in the browser.
