import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SensitivityBadge } from "./SensitivityBadge";
import { Database, Lock, Download, Eye, FileText, Users } from "lucide-react";

interface DataAssetCardProps {
  asset: {
    id: string;
    title: string;
    description: string;
    sector: string | null;
    dataType: string;
    sensitivityLevel: string;
    accessMode: string;
    anonymization: string;
    recordsCount: number | null;
    timePeriod: string | null;
    ndaRequired: boolean;
    ethicsRequired: boolean;
    createdAt: string;
    owner: {
      id: string;
      name: string;
      profile: { companyName: string | null } | null;
    };
    _count: { accessRequests: number };
  };
}

const ACCESS_MODE_ICON: Record<string, React.ElementType> = {
  download:      Download,
  metadata_only: Eye,
  controlled:    Lock,
};

const ACCESS_MODE_LABEL: Record<string, string> = {
  download:      "Download",
  metadata_only: "Metadata Only",
  controlled:    "Controlled",
};

const DATA_TYPE_LABEL: Record<string, string> = {
  tabular: "Tabular",
  image:   "Image",
  text:    "Text",
  audio:   "Audio",
  mixed:   "Mixed",
};

export function DataAssetCard({ asset }: DataAssetCardProps) {
  const ModeIcon = ACCESS_MODE_ICON[asset.accessMode] ?? Database;

  return (
    <Link href={`/data-rooms/${asset.id}`}>
      <Card className="h-full hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer group">
        <CardContent className="p-5 flex flex-col gap-3">
          {/* header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-50 transition-colors">
                <Database className="w-4 h-4 text-slate-500 group-hover:text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{asset.title}</h3>
            </div>
            <SensitivityBadge level={asset.sensitivityLevel} className="flex-shrink-0" />
          </div>

          {/* description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{asset.description}</p>

          {/* tags row */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="default">{DATA_TYPE_LABEL[asset.dataType] ?? asset.dataType}</Badge>
            {asset.sector && <Badge variant="default">{asset.sector}</Badge>}
            {asset.ndaRequired && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200">
                <FileText className="w-3 h-3" /> NDA
              </span>
            )}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
            <span className="text-xs font-medium text-slate-700 truncate">
              {asset.owner.profile?.companyName || asset.owner.name}
            </span>
            <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
              <span className="flex items-center gap-1">
                <ModeIcon className="w-3.5 h-3.5" />
                {ACCESS_MODE_LABEL[asset.accessMode]}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {asset._count.accessRequests}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
