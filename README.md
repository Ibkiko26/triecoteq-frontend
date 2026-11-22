# Tri-EcoTeq Architects

The public website is a Vite-powered, multi-page site built with semantic HTML, CSS, JavaScript, and TypeScript.

## Development

```sh
npm install
npm run dev
```

## Validation and build

```sh
npm run typecheck
npm run build
npm run preview
```

Vite builds the public pages into `dist/`. The build script copies the existing admin tools, managed content, and original media into the output so the rest of the site continues to work after deployment.

## Pages

- `index.html` — studio landing page
- `about.html` — story and team
- `services.html` — design services
- `portfolio.html` — selected projects
- `buy-plan.html` — ready-made plan catalogue
- `checkout.html` — basket review
- `contact.html` — project enquiry
- `careers.html` — job openings and applications

## Project enquiries

The Contact form uses `src/contact-api.js` to post to the site's `/api/submit-inquiry` route. The route forwards enquiries to the backend's Supabase `submit-inquiry` Edge Function, and the form confirms receipt after Airtable accepts the record.

1. Follow the enquiry setup in the [backend repository](https://github.com/Ibkiko26/triecoteq-backend#project-enquiries) to configure the Airtable table and secrets, then deploy `submit-inquiry` to Supabase.
2. Set the server-side `SUPABASE_URL` variable in the frontend Vercel project to the backend's project URL, such as `https://your-project.supabase.co`. Use the project URL without `/functions/v1/submit-inquiry`, then redeploy the frontend.

An existing Vercel deployment can continue using its server-side `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, and `AIRTABLE_TABLE_ID` while `SUPABASE_URL` is unset. With `SUPABASE_URL` set, the Edge Function handles all online enquiries. The form offers a prefilled email option if the backend is unavailable. Use `vercel dev` with a development `SUPABASE_URL` to test the API alongside Vite.

## Careers

Edit `content/careers.json` to update the department and role menus or publish a confirmed vacancy. Each entry in `openings` needs a unique `id`, a `department` from the department IDs, a `role` from that department’s role list, a `location`, an `employment` label, and a short `description`. Remove closed vacancies from the list and redeploy. An empty list lets applicants register their interest in a role.

Before accepting applications, connect a [private Vercel Blob store](https://vercel.com/docs/vercel-blob/private-storage) to this project. The connection provides `BLOB_STORE_ID` and Vercel manages authentication through OIDC. For local testing against a connected development store, use `vercel dev` so the application API runs alongside Vite.

Review submissions in the connected store’s file browser under `career-applications/<department>/`. Each ZIP contains `application.txt`, `resume.pdf`, and `portfolio.pdf` when provided. The application form returns the ZIP’s reference after the private write succeeds.
