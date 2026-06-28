"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FileText, ShieldCheck } from "lucide-react";

const NDA_TEXT = `DATA USE AGREEMENT

This Data Use Agreement ("Agreement") is entered into between the data owner ("Provider") and the researcher ("Recipient").

1. PURPOSE: The Recipient may use the data solely for the research purpose stated in their access request.

2. CONFIDENTIALITY: The Recipient agrees to keep all data strictly confidential and not disclose it to any third party.

3. NO REDISTRIBUTION: The data shall not be copied, transferred, published, or redistributed in any form.

4. SECURITY: The Recipient shall implement reasonable security measures to prevent unauthorised access.

5. COMPLIANCE: The Recipient shall comply with all applicable data protection laws and regulations.

6. TERMINATION: Access may be revoked at any time if these terms are violated.

7. LIABILITY: The Recipient accepts full liability for any breach of this agreement.

By signing, the Recipient acknowledges they have read, understood, and agree to be bound by these terms.`;

interface NdaSignModalProps {
  open:       boolean;
  onClose:    () => void;
  requestId:  string;
  assetTitle: string;
  onSigned:   () => void;
}

export function NdaSignModal({ open, onClose, requestId, assetTitle, onSigned }: NdaSignModalProps) {
  const [confirmed, setConfirmed]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]          = useState("");

  async function handleSign() {
    if (!confirmed) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/data-access-requests/${requestId}/sign-agreement`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ confirmed: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to sign agreement");
      } else {
        onSigned();
        onClose();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Data Use Agreement" className="max-w-2xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            You are signing a legally binding Data Use Agreement for access to:{" "}
            <span className="font-semibold">{assetTitle}</span>
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 max-h-64 overflow-y-auto">
          <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">{NDA_TEXT}</pre>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 flex-shrink-0"
          />
          <span className="text-sm text-slate-700">
            I have read and agree to the terms of this Data Use Agreement. I understand that violation of these terms may result in immediate revocation of access and legal consequences.
          </span>
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={!confirmed || submitting}
            className="flex-1"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            {submitting ? "Signing..." : "Sign & Confirm"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
