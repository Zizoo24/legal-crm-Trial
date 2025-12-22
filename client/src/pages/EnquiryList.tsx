import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Plus, Eye, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

const urgencyColors: Record<string, string> = {
  "Low": "bg-gray-100 text-gray-800",
  "Medium": "bg-blue-100 text-blue-800",
  "High": "bg-orange-100 text-orange-800",
  "Critical": "bg-red-100 text-red-800",
};

export default function EnquiryList() {
  const { data: enquiries, isLoading } = trpc.enquiries.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enquiry Log</h1>
          <p className="text-gray-600 mt-1">Manage all client enquiries from initial contact to conversion</p>
        </div>
        <Link href="/enquiries/new">
          <Button size="lg">
            <Plus className="h-5 w-5 mr-2" />
            New Enquiry
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Enquiries</CardTitle>
          <CardDescription>
            {enquiries?.length || 0} total enquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!enquiries || enquiries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No enquiries yet. Create your first enquiry to get started.</p>
              <Link href="/enquiries/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Enquiry
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enquiry ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Lead Lawyer</TableHead>
                    <TableHead>Matter Code</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.map((enquiry) => (
                    <TableRow key={enquiry.id}>
                      <TableCell className="font-mono text-sm">{enquiry.enquiryId}</TableCell>
                      <TableCell>{enquiry.dateOfEnquiry ? new Date(enquiry.dateOfEnquiry).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="font-medium">{enquiry.clientName}</TableCell>
                      <TableCell className="text-sm">{enquiry.serviceRequested || '-'}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[enquiry.currentStatus] || "bg-gray-100 text-gray-800"}>
                          {enquiry.currentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {enquiry.urgencyLevel && (
                          <Badge className={urgencyColors[enquiry.urgencyLevel] || "bg-gray-100 text-gray-800"}>
                            {enquiry.urgencyLevel}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{enquiry.suggestedLeadLawyer || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{enquiry.matterCode || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/enquiries/${enquiry.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
