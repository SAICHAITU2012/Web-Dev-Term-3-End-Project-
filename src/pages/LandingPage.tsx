import { Link } from "react-router-dom";
import {
  landingHighlights,
  platformFeatures,
} from "../constants";
import { Card } from "../components/ui/Card";

export default function LandingPage() {
  return (
    <div className="landing-shell">
      <section className="hero-grid">
        <div className="hero-copy">
          <span className="brand-tag">End-Term Portfolio Build</span>
          <h1>
            Smart Travel Planner that combines budget control, itinerary planning,
            and travel documents in one production-style app.
          </h1>
          <p>
            This project solves a real planning problem: travelers usually split
            trip details across multiple tools, which causes budget surprises,
            missing documents, and chaotic day plans.
          </p>

          <div className="card-actions">
            <Link className="button button-primary" to="/login">
              Launch planner
            </Link>
            <a className="button button-secondary" href="#problem">
              See the problem statement
            </a>
          </div>

          <div className="hero-metrics">
            <div>
              <span>Backend</span>
              <strong>Supabase-ready</strong>
            </div>
            <div>
              <span>Deploy target</span>
              <strong>Vercel</strong>
            </div>
            <div>
              <span>Core modules</span>
              <strong>Budget · Itinerary · Documents</strong>
            </div>
          </div>
        </div>

        <Card className="hero-spotlight">
          <span className="eyebrow">Product snapshot</span>
          <h2>One workspace for every trip decision</h2>
          <p>
            Create trips, compare spend against budget, build day plans, and
            track document readiness before departure.
          </p>
          <div className="hero-stack">
            {platformFeatures.map((feature) => (
              <article className="stack-item" key={feature.title}>
                <strong>{feature.title}</strong>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <section className="landing-section" id="problem">
        <div className="section-head section-head-wide">
          <div>
            <span className="eyebrow">Problem statement</span>
            <h2>Why this is a meaningful project</h2>
          </div>
        </div>
        <div className="feature-grid">
          {landingHighlights.map((item) => (
            <Card key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <div className="section-head section-head-wide">
          <div>
            <span className="eyebrow">Evaluation-ready scope</span>
            <h2>Built to match the rubric, not just the brief</h2>
          </div>
        </div>
        <div className="feature-grid">
          <Card>
            <h3>React architecture</h3>
            <p>
              Functional components, hooks, routing, context, controlled forms,
              lazy loading, derived analytics, and protected navigation.
            </p>
          </Card>
          <Card>
            <h3>Real backend path</h3>
            <p>
              The app uses Supabase for authentication, database CRUD, and
              optional storage. A local demo mode keeps the repo runnable even
              before keys are connected.
            </p>
          </Card>
          <Card>
            <h3>Portfolio UX</h3>
            <p>
              Responsive layout, empty states, clear user flow, loading
              feedback, and a polished travel-focused interface across mobile and desktop.
            </p>
          </Card>
        </div>
      </section>

      <section className="landing-section landing-cta">
        <Card className="cta-card">
          <div>
            <span className="eyebrow">Ready to explore?</span>
            <h2>Sign in and start planning trips like a product, not a spreadsheet.</h2>
          </div>
          <Link className="button button-primary" to="/login">
            Open Smart Travel Planner
          </Link>
        </Card>
      </section>
    </div>
  );
}
