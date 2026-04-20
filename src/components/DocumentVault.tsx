import type { DocumentItem } from "../types";
import { formatDate } from "../utils/format";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { EmptyState } from "./ui/EmptyState";

export function DocumentVault({
  documents,
  onAdd,
  onEdit,
  onDelete,
}: {
  documents: DocumentItem[];
  onAdd: () => void;
  onEdit: (document: DocumentItem) => void;
  onDelete: (document: DocumentItem) => void;
}) {
  return (
    <Card>
      <div className="section-head">
        <div>
          <span className="eyebrow">Document vault</span>
          <h3>Track what is ready before you leave home</h3>
        </div>
        <Button onClick={onAdd}>Add document</Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title="No travel documents yet"
          description="Keep passport info, visas, tickets, insurance, and hotel references in one trip workspace."
          action={<Button onClick={onAdd}>Add first document</Button>}
        />
      ) : (
        <div className="list-stack">
          {documents.map((document) => (
            <article className="list-card" key={document.id}>
              <div className="list-card-header">
                <div>
                  <h4>{document.title}</h4>
                  <p>
                    {document.type}
                    {document.referenceNumber
                      ? ` · Ref ${document.referenceNumber}`
                      : ""}
                  </p>
                </div>
                <span className={`mode-pill status-${document.status.toLowerCase()}`}>
                  {document.status}
                </span>
              </div>

              <div className="trip-meta-grid">
                <div>
                  <span>Issuer</span>
                  <strong>{document.issuer || "Not added"}</strong>
                </div>
                <div>
                  <span>Valid until</span>
                  <strong>
                    {document.validUntil ? formatDate(document.validUntil) : "Not set"}
                  </strong>
                </div>
                <div>
                  <span>Link</span>
                  <strong>
                    {document.fileUrl ? (
                      <a href={document.fileUrl} target="_blank" rel="noreferrer">
                        Open document
                      </a>
                    ) : (
                      "No file linked"
                    )}
                  </strong>
                </div>
              </div>

              {document.notes ? <p className="muted-copy">{document.notes}</p> : null}

              <div className="card-actions">
                <Button variant="secondary" onClick={() => onEdit(document)}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDelete(document)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
