import { useEffect, useRef, useState } from "react";
import type {
  DocumentDraft,
  DocumentItem,
  DocumentType,
} from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";

const documentTypes: DocumentType[] = [
  "Passport",
  "Visa",
  "Insurance",
  "Flight Ticket",
  "Hotel Booking",
  "Other",
];

function createDefaultDraft(tripId: string): DocumentDraft {
  return {
    tripId,
    type: "Passport",
    title: "",
    referenceNumber: "",
    issuer: "",
    validUntil: "",
    status: "Pending",
    fileUrl: "",
    notes: "",
  };
}

function toDraft(document: DocumentItem | null | undefined, tripId: string) {
  return document
    ? {
        tripId: document.tripId,
        type: document.type,
        title: document.title,
        referenceNumber: document.referenceNumber,
        issuer: document.issuer,
        validUntil: document.validUntil,
        status: document.status,
        fileUrl: document.fileUrl,
        notes: document.notes,
      }
    : createDefaultDraft(tripId);
}

export function DocumentForm({
  open,
  onClose,
  initialDocument,
  tripId,
  supportsUploads,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  initialDocument?: DocumentItem | null;
  tripId: string;
  supportsUploads: boolean;
  onSubmit: (draft: DocumentDraft, options: { file: File | null }) => Promise<void>;
  submitting: boolean;
}) {
  const [form, setForm] = useState<DocumentDraft>(createDefaultDraft(tripId));
  const [file, setFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setForm(toDraft(initialDocument, tripId));
    setFile(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }, [initialDocument, open, tripId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(form, { file });
  }

  return (
    <Modal
      title={initialDocument ? "Update document" : "Add travel document"}
      open={open}
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="grid-two">
          <Select
            label="Document type"
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: event.target.value as DocumentType,
              }))
            }
          >
            {documentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <Input
            label="Document title"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Japan eVisa PDF"
            required
          />
          <Input
            label="Reference number"
            value={form.referenceNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                referenceNumber: event.target.value,
              }))
            }
          />
          <Input
            label="Issuer"
            value={form.issuer}
            onChange={(event) =>
              setForm((current) => ({ ...current, issuer: event.target.value }))
            }
            placeholder="Embassy / airline / insurer"
          />
          <Input
            label="Valid until"
            type="date"
            value={form.validUntil}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                validUntil: event.target.value,
              }))
            }
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as DocumentDraft["status"],
              }))
            }
          >
            <option value="Pending">Pending</option>
            <option value="Ready">Ready</option>
            <option value="Expired">Expired</option>
          </Select>
        </div>

        <Input
          label="External URL"
          value={form.fileUrl}
          onChange={(event) =>
            setForm((current) => ({ ...current, fileUrl: event.target.value }))
          }
          placeholder="https://..."
          hint="Use this if your file already lives in Drive, Dropbox, or another safe source."
        />

        <label className="field">
          <span className="field-label">Optional file upload</span>
          <input
            className="field-input"
            type="file"
            ref={fileRef}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            disabled={!supportsUploads}
          />
          <span className="field-hint">
            {supportsUploads
              ? "Stored in Supabase Storage when a bucket is configured."
              : "Connect Supabase Storage to enable direct uploads. Metadata still works in demo mode."}
          </span>
        </label>

        <Textarea
          label="Notes"
          rows={4}
          value={form.notes}
          onChange={(event) =>
            setForm((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder="Checklist, embassy notes, renewal reminders, emergency access instructions."
        />

        <div className="modal-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : initialDocument ? "Save changes" : "Add document"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
