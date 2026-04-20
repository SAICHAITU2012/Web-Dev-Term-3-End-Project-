# Smart Travel Planner

Smart Travel Planner is a portfolio-grade React application that solves a real travel planning problem: travelers often split budgets, itineraries, and important documents across notes apps, spreadsheets, chats, and email threads. This project brings those workflows into one responsive workspace with authentication, protected routes, persistent data, and CRUD features.

## Problem Statement

### Who is the user?
Students, solo travelers, families, and working professionals who need a reliable way to plan upcoming trips without losing track of costs, schedules, or required documents.

### What problem does this solve?
Trip planning is fragmented. Budgets live in spreadsheets, itinerary ideas live in chats, and passports, visas, tickets, and insurance details live somewhere else entirely. That fragmentation causes missed bookings, hidden costs, and unnecessary travel stress.

### Why does this matter?
A trip is full of decisions that depend on each other. When the budget, itinerary, and documents are disconnected, people overspend, miss deadlines, or leave with incomplete paperwork. This app reduces that risk by centralizing the entire planning flow.

## Core Features

- Authentication with protected routes
- Dashboard with trip analytics and upcoming itinerary highlights
- Trip CRUD with destination, date, traveler, budget, and status management
- Budget planner with planned vs actual spend tracking
- Itinerary manager with timeline-based activity blocks
- Document vault for passport, visa, insurance, and booking references
- Responsive UI for desktop and mobile
- Persistent data using Supabase when configured
- Local demo mode using browser storage so the project runs immediately

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Context API
- Supabase Auth + Database + optional Storage
- Vercel for deployment
- Custom CSS design system

## React Concepts Demonstrated

- Functional Components
- Props and component composition
- `useState`
- `useEffect`
- Conditional rendering
- Lists and keys
- Lifting state up
- Controlled components
- React Router
- Context API
- `useMemo`
- `useRef`
- `React.lazy` and `Suspense`
- `useDeferredValue`
- `useTransition`

## Folder Structure

```text
src/
  components/
    forms/
    layout/
    ui/
  context/
  hooks/
  pages/
  services/
  utils/
supabase/
```

## Demo Mode

If Supabase environment variables are not added, the app still works in a local demo mode using `localStorage`.

Demo credentials:

- Email: `demo@smarttravelplanner.app`
- Password: `demo12345`

This helps during development and portfolio review, but for the final evaluation you should connect a real Supabase project so the backend requirement is fully satisfied.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_STORAGE_BUCKET=travel-documents
```

4. Run the app:

```bash
npm run dev
```

## Supabase Setup

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run the schema in [supabase/schema.sql](/Users/saichaitu/Desktop/Web%20Dev%20Term%203%20End%20Project/supabase/schema.sql).
4. In Authentication settings, make sure email/password auth is enabled.
5. If you want Google login, enable the Google provider in Supabase Auth and add your local URL and deployed Vercel URL to the allowed redirect list.
6. For the smoothest demo, disable mandatory email confirmation unless you specifically want to showcase that flow.
7. If you want direct document uploads, keep the storage bucket name aligned with `VITE_SUPABASE_STORAGE_BUCKET`.

## Vercel Deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Add the same environment variables from `.env`.
4. Deploy using the default Vite build settings.
5. The included `vercel.json` handles SPA route rewrites.

## Available Scripts

- `npm run dev` starts the local development server
- `npm run build` creates a production build
- `npm run preview` previews the production build locally
- `npm run lint` checks code quality with ESLint

## Viva-Friendly Architecture Notes

- `AuthContext` manages global authentication state and protected navigation.
- `ToastContext` manages app-wide feedback messages.
- `travelApi` switches between a live Supabase backend and a local demo store.
- `TripsPage` handles trip CRUD and search/filter logic.
- `TripDetailsPage` lifts state up and coordinates budget, itinerary, and document workflows.
- `ProfilePage` doubles as an explainability page for React concepts and deployment details.

## Suggested Demo Video Flow

1. Explain the problem and target user.
2. Show login or demo access.
3. Create a new trip.
4. Add a budget item.
5. Add an itinerary block.
6. Add a travel document.
7. Show the dashboard summary and trip detail workspace.
8. Explain why Supabase and React Router were chosen.

## Final Submission Tips

- Connect a real Supabase project before submission.
- Deploy on Vercel and include the live link.
- Practice explaining how auth, protected routes, and CRUD are implemented.
- Be ready to point out where `useEffect`, Context API, `useMemo`, and lazy loading are used.
