import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { BarChart3, FileText, DollarSign, TrendingUp, ArrowRight, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const features = [
    {
      icon: FileText,
      title: "Enquiry Management",
      description: "Track all client enquiries from initial contact through conversion with auto-generated IDs and comprehensive data capture.",
    },
    {
      icon: BarChart3,
      title: "Status Tracking",
      description: "Monitor enquiry distribution across statuses with real-time counts, percentages, and visual indicators.",
    },
    {
      icon: TrendingUp,
      title: "KPI Dashboard",
      description: "View key performance metrics including conversion rates, response times, and revenue tracking.",
    },
    {
      icon: DollarSign,
      title: "Payment Tracking",
      description: "Manage payment milestones for converted clients with automated data linking and status monitoring.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Client Enquiry CRM</h1>
          </div>
          {isAuthenticated ? (
            <Link href="/enquiries">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <Button asChild>
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Comprehensive Legal Enquiry
          <br />
          <span className="text-blue-600">Management System</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Track client enquiries from initial contact through conversion and payment. 
          Streamline your legal practice with automated ID generation, real-time dashboards, 
          and comprehensive analytics.
        </p>
        {isAuthenticated ? (
          <Link href="/enquiries">
            <Button size="lg" className="text-lg px-8">
              Open Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        ) : (
          <Button size="lg" className="text-lg px-8" asChild>
            <a href={getLoginUrl()}>
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        )}
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Everything You Need to Manage Client Enquiries
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-blue-300 transition-colors">
              <CardHeader>
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Key Features List */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-gray-900">Key Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Auto-Generated IDs</p>
                <p className="text-sm text-gray-600">Enquiry IDs (ENQ-0001) and Matter Codes (MAT-2025-001)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">40+ Data Fields</p>
                <p className="text-sm text-gray-600">Comprehensive client and service tracking</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Status Color Coding</p>
                <p className="text-sm text-gray-600">Green for converted, red for overdue, orange for critical</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Multi-User Access</p>
                <p className="text-sm text-gray-600">Role-based permissions for team collaboration</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Pipeline Forecast</p>
                <p className="text-sm text-gray-600">Weighted revenue projections by status probability</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Payment Milestones</p>
                <p className="text-sm text-gray-600">Track retainer, mid-payment, and final payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>Client Enquiry CRM System - Legal Practice Management</p>
        </div>
      </footer>
    </div>
  );
}
