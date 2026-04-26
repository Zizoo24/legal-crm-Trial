import { Link } from "wouter";
import { Plus, Briefcase, Calendar, DollarSign } from "lucide-react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  active:   "bg-green-100 text-green-700",
  pending:  "bg-yellow-100 text-yellow-700",
  closed:   "bg-gray-100 text-gray-600",
  on_hold:  "bg-orange-100 text-orange-700",
  archived: "bg-slate-100 text-slate-600",
};

const PRIORITY_COLORS: Record<string, string> = {
  low:    "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high:   "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

export default function MatterList() {
  const { data: matters = [], isLoading } = trpc.matters.list.useQuery();

  const formatCurrency = (v: string | null) =>
    v ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(Number(v)) : null;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Matters</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {matters.length} matter{matters.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/matters/new">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Matter</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="py-4"><div className="h-12 animate-pulse bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : matters.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No matters yet.{" "}
              <Link href="/matters/new" className="text-blue-600 hover:underline">Open the first matter</Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {matters.map(matter => (
              <Link key={matter.id} href={`/matters/${matter.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4 px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-indigo-50 flex-shrink-0">
                          <Briefcase className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-muted-foreground">{matter.matterCode}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[matter.status ?? "pending"]}`}
                            >
                              {matter.status?.replace("_", " ")}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PRIORITY_COLORS[matter.priority ?? "medium"]}`}
                            >
                              {matter.priority}
                            </span>
                          </div>
                          <p className="font-semibold text-sm mt-0.5 truncate">{matter.title}</p>
                          <p className="text-xs text-muted-foreground">{matter.clientName}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-1">
                        {matter.estimatedValue && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(matter.estimatedValue)}
                          </div>
                        )}
                        {matter.openDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                            <Calendar className="h-3 w-3" />
                            {new Date(matter.openDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
