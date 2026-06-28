import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, XCircle } from "lucide-react";

interface Step {
  label: string;
  key: string;
}

const STEPS: Step[] = [
  { key: "submitted",    label: "Submitted"     },
  { key: "owner_review", label: "Owner Review"  },
  { key: "admin_review", label: "Admin Review"  },
  { key: "nda_sign",     label: "Sign NDA"      },
  { key: "access",       label: "Access Granted" },
];

function getActiveStep(status: string, ownerDecision?: string | null, adminDecision?: string | null, hasAgreement?: boolean): number {
  if (status === "rejected")  return -1; // special: rejected
  if (status === "revoked")   return -2;
  if (hasAgreement)           return 4;
  if (status === "approved" && adminDecision === "approved") return 3;
  if (status === "admin_review") return 2;
  if (status === "owner_review" || (status === "pending" && ownerDecision === null)) return 1;
  return 0;
}

interface RequestStatusStepperProps {
  status: string;
  ownerDecision?: string | null;
  adminDecision?: string | null;
  hasAgreement?: boolean;
}

export function RequestStatusStepper({ status, ownerDecision, adminDecision, hasAgreement }: RequestStatusStepperProps) {
  const activeStep = getActiveStep(status, ownerDecision, adminDecision, hasAgreement);

  const isRejected = status === "rejected" || status === "revoked";

  return (
    <div className="w-full">
      {isRejected ? (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <XCircle className="w-4 h-4" />
          <span className="font-medium capitalize">{status === "revoked" ? "Access Revoked" : "Request Rejected"}</span>
        </div>
      ) : (
        <div className="flex items-center gap-0">
          {STEPS.map((step, idx) => {
            const done    = idx < activeStep;
            const current = idx === activeStep;
            const pending = idx > activeStep;

            return (
              <div key={step.key} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center flex-shrink-0">
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : current ? (
                    <div className="w-5 h-5 rounded-full border-2 border-emerald-600 bg-emerald-50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    </div>
                  ) : (
                    <Circle className={cn("w-5 h-5", pending ? "text-slate-300" : "text-slate-300")} />
                  )}
                  <span className={cn(
                    "text-[10px] mt-1 text-center leading-tight whitespace-nowrap",
                    done    ? "text-emerald-600 font-medium" :
                    current ? "text-emerald-700 font-semibold" :
                              "text-slate-400",
                  )}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-1 mb-4",
                    done ? "bg-emerald-500" : "bg-slate-200",
                  )} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
