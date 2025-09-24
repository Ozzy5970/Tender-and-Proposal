# Copilot Instructions for AI Coding Agents

## Project Overview
This is a Next.js application for managing tenders and proposals. The codebase is structured for modularity and leverages Next.js app routing, Supabase integration, and custom React components.

## Architecture & Key Components
- **Next.js App Directory**: Main app logic is in `src/app/` (see `page.js`, `layout.js`).
- **Pages Directory**: Legacy Next.js pages and API routes in `pages/`.
  - API endpoints: `pages/api/` (e.g., `create-proposal.js`, `get-signed-url.js`, `upload.js`).
  - Dashboard: `pages/dashboard.js`.
- **Components**: Shared React components in `components/` (e.g., `Download.js`).
- **Lib Directory**: Supabase integration and utility functions in `lib/` (`supabaseClient.js`, `api.js`, `adminSupabase.js`).
- **Public Assets**: SVGs and static files in `public/`.

## Data Flow & Integration
- **Supabase**: Used for authentication, storage, and database operations. See `lib/supabaseClient.js` and API routes for usage patterns.
- **File Uploads**: Handled via API routes (`pages/api/upload.js`, `get-signed-url.js`).
- **Download/Export**: Custom logic in `components/Download.js`.

## Developer Workflows
- **Development**: Start with `npm run dev` (see README).
- **Hot Reload**: Edit files in `src/app/` or `pages/` for instant updates.
- **API Testing**: Use Next.js API routes for backend logic; test endpoints via browser or tools like Postman.
- **No explicit test suite detected**: Add tests in `__tests__/` or use Jest if needed.

## Project-Specific Conventions
- **App Directory**: Prefer `src/app/` for new pages/components; legacy code may exist in `pages/`.
- **Supabase Usage**: Centralized in `lib/`; always import from there for consistency.
- **SVG Assets**: Store in `public/` and reference via `/file.svg` etc.
- **Config Files**: Use `.mjs` for config (e.g., `next.config.mjs`, `postcss.config.mjs`).

## External Dependencies
- **Next.js**: Core framework.
- **Supabase JS**: For backend integration.
- **PostCSS**: For CSS processing.

## Examples
- To add a new API route: create a file in `pages/api/` and export a handler.
- To use Supabase: import from `lib/supabaseClient.js`.
- To add a new page: prefer `src/app/` and update `page.js`.

## References
- `README.md`: Basic setup and dev instructions.
- `lib/`: Supabase and API logic.
- `components/`: UI building blocks.
- `pages/api/`: Backend endpoints.

---

**Feedback Requested:**
If any conventions, workflows, or integration details are unclear or missing, please specify so this guide can be improved for future AI agents.
