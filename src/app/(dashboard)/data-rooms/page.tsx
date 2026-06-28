"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataAssetCard } from "@/components/data-rooms/DataAssetCard";
import { Database, Plus, Search } from "lucide-react";
import { BD_SECTORS } from "@/lib/utils";

interface DataAsset {
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
}

const DATA_TYPES = [
  { value: "",        label: "All Types"    },
  { value: "tabular", label: "Tabular"      },
  { value: "image",   label: "Image"        },
  { value: "text",    label: "Text"         },
  { value: "audio",   label: "Audio"        },
  { value: "mixed",   label: "Mixed"        },
];

const SENSITIVITY_LEVELS = [
  { value: "",         label: "All Sensitivity" },
  { value: "low",      label: "Low"             },
  { value: "medium",   label: "Medium"          },
  { value: "high",     label: "High"            },
  { value: "critical", label: "Critical"        },
];

const ACCESS_MODES = [
  { value: "",              label: "All Access Modes"  },
  { value: "download",      label: "Download"          },
  { value: "metadata_only", label: "Metadata Only"     },
  { value: "controlled",    label: "Controlled"        },
];

export default function DataRoomsPage() {
  const { data: session } = useSession();
  const [assets, setAssets]         = useState<DataAsset[]>([]);
  const [search, setSearch]         = useState("");
  const [sector, setSector]         = useState("");
  const [dataType, setDataType]     = useState("");
  const [sensitivity, setSensitivity] = useState("");
  const [accessMode, setAccessMode] = useState("");
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchAssets(); }, [page, sector, dataType, sensitivity, accessMode]);

  async function fetchAssets() {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "12" });
    if (search)      params.set("search",           search);
    if (sector)      params.set("sector",           sector);
    if (dataType)    params.set("dataType",         dataType);
    if (sensitivity) params.set("sensitivityLevel", sensitivity);
    if (accessMode)  params.set("accessMode",       accessMode);

    const res  = await fetch(`/api/data-assets?${params}`);
    const data = await res.json();
    setAssets(data.assets || []);
    setTotal(data.total   || 0);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchAssets();
  }

  const canCreate = session && ["industry", "government", "admin"].includes(session.user.role);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Secure Data Rooms</h1>
          <p className="text-slate-600 mt-1">Browse curated datasets from verified organisations. Request access to fuel your research.</p>
        </div>
        {canCreate && (
          <Link href="/data-rooms/new">
            <Button><Plus className="w-4 h-4 mr-1" /> Publish Dataset</Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search datasets..."
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="secondary">Search</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={sector}
              onChange={(e) => { setSector(e.target.value); setPage(1); }}
              options={[{ value: "", label: "All Sectors" }, ...BD_SECTORS.map((s) => ({ value: s, label: s }))]}
              className="flex-1 min-w-[140px]"
            />
            <Select
              value={dataType}
              onChange={(e) => { setDataType(e.target.value); setPage(1); }}
              options={DATA_TYPES}
              className="flex-1 min-w-[140px]"
            />
            <Select
              value={sensitivity}
              onChange={(e) => { setSensitivity(e.target.value); setPage(1); }}
              options={SENSITIVITY_LEVELS}
              className="flex-1 min-w-[150px]"
            />
            <Select
              value={accessMode}
              onChange={(e) => { setAccessMode(e.target.value); setPage(1); }}
              options={ACCESS_MODES}
              className="flex-1 min-w-[150px]"
            />
          </div>
        </form>
      </div>

      <p className="text-sm text-slate-500 mb-4">{total} dataset{total !== 1 ? "s" : ""} found</p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : assets.length === 0 ? (
        <Card className="p-12">
          <CardContent className="p-0 text-center">
            <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No datasets found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <DataAssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
