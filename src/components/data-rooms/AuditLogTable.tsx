import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ACTION_COLORS: Record<string, string> = {
  viewed_metadata:       "default",
  requested_access:      "info",
  owner_approved:        "success",
  owner_rejected:        "danger",
  admin_approved:        "success",
  admin_rejected:        "danger",
  agreement_signed:      "info",
  access_granted:        "success",
  download_attempted:    "warning",
  access_revoked:        "danger",
  access_expired:        "warning",
  asset_created:         "default",
  submitted_for_review:  "info",
};

interface AuditLog {
  id:         string;
  userId:     string;
  action:     string;
  ipAddress:  string | null;
  createdAt:  string;
  dataAsset:  { id: string; title: string };
  user?:      { id: string; name: string; email: string; role: string } | null;
}

interface AuditLogTableProps {
  logs:        AuditLog[];
  total:       number;
  page:        number;
  totalPages:  number;
  onPageChange: (page: number) => void;
}

export function AuditLogTable({ logs, total, page, totalPages, onPageChange }: AuditLogTableProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-500">{total} total log entries</p>

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Action</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide hidden md:table-cell">Asset</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide hidden lg:table-cell">IP</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">No audit log entries found</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    {log.user ? (
                      <div>
                        <p className="font-medium text-slate-900 text-xs">{log.user.name}</p>
                        <p className="text-slate-400 text-[11px]">{log.user.role}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">{log.userId.slice(0, 8)}…</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={(ACTION_COLORS[log.action] as "default" | "success" | "danger" | "warning" | "info") ?? "default"}>
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-slate-600 text-xs line-clamp-1">{log.dataAsset?.title || "—"}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-slate-400 text-xs font-mono">{log.ipAddress || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-500 text-xs">{formatDate(log.createdAt)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
