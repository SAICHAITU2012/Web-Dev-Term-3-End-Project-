import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";

export default function NotFoundPage() {
  return (
    <div className="screen-center">
      <Card className="auth-card">
        <span className="eyebrow">404</span>
        <h2>That page has drifted off itinerary.</h2>
        <p>The route you requested does not exist in this planner.</p>
        <Link className="button button-primary" to="/">
          Return home
        </Link>
      </Card>
    </div>
  );
}
