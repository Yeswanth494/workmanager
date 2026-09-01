# WorkSphere — Frontend

Enterprise Employee, Project & Task Management Platform.
React 19 + TypeScript + Vite + Tailwind CSS v4.

## Stage 1 — what's built

- Design system: color/type tokens in `src/index.css`, reusable UI kit in `src/components/ui`
- App shell: responsive Sidebar/Navbar/Layouts, role-filtered navigation
- Auth: Login / Register / Forgot / Reset password, `AuthContext`, protected + role-based routes
- Role-aware Dashboard (Admin / Manager / Employee) with charts (Recharts) and mock data
- Routing skeleton for every module (Employees, Departments, Projects, Tasks, Leave, Timesheets, Reports, Notifications, Profile) with placeholder screens ready to be filled in during the next stages
- Mock `authService` so the whole app runs with **no backend** — swap it for real Axios calls to Spring Boot later without touching components

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL and log in with one of the demo accounts (password: `password`):

| Role     | Email                   |
|----------|-------------------------|
| Admin    | admin@worksphere.io     |
| Manager  | manager@worksphere.io   |
| Employee | employee@worksphere.io  |

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production
- `npm run preview` — preview the production build
- `npm run lint` — run Oxlint

## Project structure

Follows the agreed architecture: `components/{ui,layout,common,forms,tables,charts}`, `pages/<module>`, `services`, `context`, `hooks`, `routes`, `types`, `mocks`, `utils`, `layouts`. See the full tree in the repo.

## Next stages

Employee Management → Departments → Projects → Tasks/Kanban → Leave → Timesheets → Reports → Notifications/Profile polish → connect Spring Boot backend (replace `services/*.ts` mock implementations with real API calls).
