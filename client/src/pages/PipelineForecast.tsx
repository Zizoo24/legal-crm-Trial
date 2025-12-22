import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function PipelineForecast() {
  const { data: forecast, isLoading } = trpc.enquiries.pipelineForecast.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalWeightedValue = forecast?.reduce((sum, item) => sum + item.weightedValue, 0) || 0;
  const totalValue = forecast?.reduce((sum, item) => sum + item.totalValue, 0) || 0;

  const statusColors: Record<string, string> = {
    "Pending": "bg-gray-100 text-gray-800",
    "Contacted": "bg-blue-100 text-blue-800",
    "Meeting Scheduled": "bg-purple-100 text-purple-800",
    "Proposal Sent": "bg-yellow-100 text-yellow-800",
    "Converted": "bg-green-100 text-green-800",
    "Declined": "bg-red-100 text-red-800",
    "Conflict": "bg-orange-100 text-orange-800",
    "Not Pursued": "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pipeline Forecast</h1>
        <p className="text-gray-600 mt-1">Weighted revenue projections based on status probability</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pipeline Value</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {totalValue.toLocaleString()} SAR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Sum of all proposal values</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Weighted Forecast</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {totalWeightedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })} SAR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Expected revenue based on probability</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Probability Factor</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {totalValue > 0 ? ((totalWeightedValue / totalValue) * 100).toFixed(0) : 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Overall conversion likelihood</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Breakdown by Status</CardTitle>
          <CardDescription>Revenue forecast with probability weighting</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Total Value (SAR)</TableHead>
                <TableHead className="text-right">Probability</TableHead>
                <TableHead className="text-right">Weighted Value (SAR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecast && forecast.length > 0 ? (
                forecast.map((item) => (
                  <TableRow key={item.status}>
                    <TableCell>
                      <Badge className={statusColors[item.status] || "bg-gray-100 text-gray-800"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{item.count}</TableCell>
                    <TableCell className="text-right font-medium">
                      {item.totalValue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{(item.probability * 100).toFixed(0)}%</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {item.weightedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No pipeline data available. Add proposal values to enquiries to see forecasts.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <TrendingUp className="inline h-5 w-5 mr-2" />
            Probability Methodology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">Status Probability Weights</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• <strong>Pending:</strong> 10% - Initial enquiry received</li>
                <li>• <strong>Contacted:</strong> 20% - First response sent</li>
                <li>• <strong>Meeting Scheduled:</strong> 40% - Client engagement confirmed</li>
                <li>• <strong>Proposal Sent:</strong> 60% - Formal proposal submitted</li>
                <li>• <strong>Converted:</strong> 100% - Client signed engagement letter</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-gray-900">How to Use This Forecast</h4>
              <p className="text-gray-600 mb-2">
                The weighted forecast provides a realistic revenue projection by multiplying each enquiry's 
                proposal value by the probability of conversion based on its current status.
              </p>
              <p className="text-gray-600">
                Use this data to plan resource allocation, set revenue targets, and identify which stages 
                need more attention to improve conversion rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
