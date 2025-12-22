import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StatusTracker() {
  const { data: summary, isLoading } = trpc.enquiries.statusSummary.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalCount = summary?.reduce((sum, item) => sum + item.count, 0) || 0;

  const statusOrder = [
    "Pending",
    "Contacted",
    "Meeting Scheduled",
    "Proposal Sent",
    "Converted",
    "Declined",
    "Conflict",
    "Not Pursued"
  ];

  const sortedSummary = [...(summary || [])].sort((a, b) => {
    const indexA = statusOrder.indexOf(a.status || "");
    const indexB = statusOrder.indexOf(b.status || "");
    return indexA - indexB;
  });

  const statusColors: Record<string, string> = {
    "Pending": "bg-gray-500",
    "Contacted": "bg-blue-500",
    "Meeting Scheduled": "bg-purple-500",
    "Proposal Sent": "bg-yellow-500",
    "Converted": "bg-green-500",
    "Declined": "bg-red-500",
    "Conflict": "bg-orange-500",
    "Not Pursued": "bg-gray-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Status Tracker</h1>
        <p className="text-gray-600 mt-1">Monitor enquiry distribution across all statuses</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Enquiries</CardDescription>
            <CardTitle className="text-4xl">{totalCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-4xl text-blue-600">
              {summary?.filter(s => ["Pending", "Contacted", "Meeting Scheduled", "Proposal Sent"].includes(s.status || "")).reduce((sum, s) => sum + s.count, 0) || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Converted</CardDescription>
            <CardTitle className="text-4xl text-green-600">
              {summary?.find(s => s.status === "Converted")?.count || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Successfully closed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Lost</CardDescription>
            <CardTitle className="text-4xl text-red-600">
              {summary?.filter(s => ["Declined", "Conflict", "Not Pursued"].includes(s.status || "")).reduce((sum, s) => sum + s.count, 0) || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Not converted</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enquiries by Status</CardTitle>
          <CardDescription>Distribution of all enquiries across different stages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedSummary.map((item) => {
            const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
            return (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${statusColors[item.status || ""] || "bg-gray-500"}`}></div>
                    <span className="font-medium text-gray-900">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                    <span className="font-semibold text-gray-900 min-w-[3rem] text-right">{item.count}</span>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
