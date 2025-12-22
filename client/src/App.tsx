import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import EnquiryList from "./pages/EnquiryList";
import EnquiryForm from "./pages/EnquiryForm";
import StatusTracker from "./pages/StatusTracker";
import KPIDashboard from "./pages/KPIDashboard";
import PaymentTracker from "./pages/PaymentTracker";
import PipelineForecast from "./pages/PipelineForecast";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/enquiries"}>
        <DashboardLayout>
          <EnquiryList />
        </DashboardLayout>
      </Route>
      <Route path={"/enquiries/new"}>
        <DashboardLayout>
          <EnquiryForm />
        </DashboardLayout>
      </Route>
      <Route path={"/enquiries/:id"}>
        {(params) => (
          <DashboardLayout>
            <EnquiryForm id={parseInt(params.id)} />
          </DashboardLayout>
        )}
      </Route>
      <Route path={"/status-tracker"}>
        <DashboardLayout>
          <StatusTracker />
        </DashboardLayout>
      </Route>
      <Route path={"/kpi-dashboard"}>
        <DashboardLayout>
          <KPIDashboard />
        </DashboardLayout>
      </Route>
      <Route path={"/payment-tracker"}>
        <DashboardLayout>
          <PaymentTracker />
        </DashboardLayout>
      </Route>
      <Route path={"/pipeline-forecast"}>
        <DashboardLayout>
          <PipelineForecast />
        </DashboardLayout>
      </Route>
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
