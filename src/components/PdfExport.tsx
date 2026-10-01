import { useEffect, useState } from "react";
import { SEVERITY_NAMES } from "../config.ts";
import type { Inspection } from "../lib/inspection.ts";
import { getPhoto } from "../lib/photos.ts";
import { Icon } from "./Icon.tsx";
import type { Report } from "../lib/report.ts";

interface Props {
  inspection: Inspection;
  report: Report;
}

type State =
  | { step: "idle" }
  | { step: "working"; message: string }
  | { step: "ready"; file: File; url: string }
  | { step: "error" };

export function PdfExport({ inspection, report }: Props) {
  const [state, setState] = useState<State>({ step: "idle" });

  // A new report makes any earlier PDF out of date.
  useEffect(() => {
    setState({ step: "idle" });
  }, [report, inspection.details]);

  useEffect(() => {
    if (state.step !== "ready") return;
    return () => URL.revokeObjectURL(state.url);
  }, [state]);

  async function create() {
    setState({ step: "working", message: "Making your PDF…" });
    try {
      // Loaded only when needed, so the app itself stays small.
      const { createReportPdf, reportFileName } = await import("../lib/pdf.ts");
      const bytes = await createReportPdf({
        inspection,
        report,
        loadPhoto: getPhoto,
        onProgress: (message) => setState({ step: "working", message }),
      });
      const file = new File(
        [new Uint8Array(bytes)],
        reportFileName(inspection.details),
        {
          type: "application/pdf",
        },
      );
      setState({ step: "ready", file, url: URL.createObjectURL(file) });
    } catch (error) {
      console.error(error);
      setState({ step: "error" });
    }
  }

  async function share(file: File) {
    try {
      await navigator.share({
        files: [file],
        title: "Handover inspection report",
      });
    } catch {
      // The buyer closed the share sheet, or sharing failed. They can still
      // save the file with the other button.
    }
  }

  const canShare =
    state.step === "ready" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [state.file] });

  return (
    <section className="card">
      <div className="card__head">
        <span className="icon-tile">
          <Icon name="report" size={22} />
        </span>
        <h2>PDF report</h2>
      </div>
      <p className="small muted">
        Lists problems room by room with {SEVERITY_NAMES.safety} items first,
        then the items checked OK. Give it to the developer and ask them to sign
        it with a repair date.
      </p>

      {state.step === "ready" ? (
        <>
          <p>
            <strong>Your PDF is ready:</strong> {state.file.name}
          </p>
          <div className="btn-row">
            {canShare && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => share(state.file)}
              >
                <Icon name="share" size={18} />
                Share PDF
              </button>
            )}
            <a
              className={`btn ${canShare ? "" : "btn--primary"}`}
              href={state.url}
              download={state.file.name}
            >
              <Icon name="download" size={18} />
              Save PDF
            </a>
          </div>
        </>
      ) : (
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={state.step === "working"}
          onClick={create}
        >
          {state.step === "working" ? state.message : "Make PDF report"}
        </button>
      )}

      {state.step === "error" && (
        <p className="small error-text" role="alert">
          The PDF could not be made. Please try again. If it keeps failing, try
          removing very large photos.
        </p>
      )}
    </section>
  );
}
