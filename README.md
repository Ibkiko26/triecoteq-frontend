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

## Careers

Edit `content/careers.json` to update the department and role menus or publish a confirmed vacancy. Each entry in `openings` needs a unique `id`, a `department` from the department IDs, a `role` from that department’s role list, a `location`, an `employment` label, and a short `description`. Remove closed vacancies from the list and redeploy. An empty list lets applicants register their interest in a role.

Before accepting applications, connect a [private Vercel Blob store](https://vercel.com/docs/vercel-blob/private-storage) to this project. The connection provides `BLOB_STORE_ID` and Vercel manages authentication through OIDC. For local testing against a connected development store, use `vercel dev` so the application API runs alongside Vite.

Review submissions in the connected store’s file browser under `career-applications/<department>/`. Each ZIP contains `application.txt`, `resume.pdf`, and `portfolio.pdf` when provided. The application form returns the ZIP’s reference after the private write succeeds.
