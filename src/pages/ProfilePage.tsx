import { reactConceptMap } from "../constants";
import { Card } from "../components/ui/Card";
import { useAuth } from "../hooks/useAuth";
import { travelApi } from "../services/travelApi";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <span className="eyebrow">Project and profile notes</span>
          <h2>Explainability page for viva and deployment</h2>
          <p>
            This screen doubles as a practical profile page and a quick summary
            of the project architecture, backend mode, and React concepts used.
          </p>
        </div>
      </section>

      <section className="dashboard-grid">
        <Card>
          <span className="eyebrow">Current user</span>
          <h3>{user?.fullName}</h3>
          <p>{user?.email}</p>
          <div className="trip-meta-grid">
            <div>
              <span>Auth mode</span>
              <strong>{user?.authMode === "demo" ? "Local demo" : "Supabase"}</strong>
            </div>
            <div>
              <span>Data mode</span>
              <strong>{travelApi.mode === "demo" ? "Local persistence" : "Supabase tables"}</strong>
            </div>
            <div>
              <span>Document uploads</span>
              <strong>{travelApi.supportsUploads ? "Enabled" : "Metadata only"}</strong>
            </div>
          </div>
        </Card>

        <Card>
          <span className="eyebrow">Deployment checklist</span>
          <h3>For final submission</h3>
          <div className="list-stack">
            <article className="list-card">
              <strong>1. Add Supabase env vars</strong>
              <p>Fill `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and optionally a storage bucket.</p>
            </article>
            <article className="list-card">
              <strong>2. Run the SQL schema</strong>
              <p>Create the tables, policies, and storage rules from the included `supabase/schema.sql` file.</p>
            </article>
            <article className="list-card">
              <strong>3. Deploy to Vercel</strong>
              <p>Import the repo, add the same environment variables, and let Vercel run the Vite build.</p>
            </article>
          </div>
        </Card>
      </section>

      <Card>
        <div className="section-head">
          <div>
            <span className="eyebrow">React concept map</span>
            <h3>Exactly what to explain during viva</h3>
          </div>
        </div>
        <div className="concept-grid">
          {reactConceptMap.map(([concept, usage]) => (
            <article className="list-card" key={concept}>
              <strong>{concept}</strong>
              <p>{usage}</p>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
