import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DeferredScripts from "./components/DeferredScripts";
import GA4Script from "./components/GA4Script";
import AnalyticsListener from "./components/AnalyticsListener";

// Eager-load homepage for fast LCP
import Index from "./pages/Index";

// Lazy-load all other pages
const Partners = lazy(() => import("./pages/Partners"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Format = lazy(() => import("./pages/Format"));
const Venue = lazy(() => import("./pages/Venue"));
const Survey = lazy(() => import("./pages/Survey"));
const FAQ = lazy(() => import("./pages/FAQ"));
const VIP = lazy(() => import("./pages/VIP"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const GASetup = lazy(() => import("./pages/GASetup"));
const ThankYouEnhanced = lazy(() => import("./pages/ThankYouEnhanced"));
const AdminRegistrations = lazy(() => import("./pages/AdminRegistrations"));
const AdminSales = lazy(() => import("./pages/AdminSales"));
const AdminFormulaAttendees = lazy(() => import("./pages/AdminFormulaAttendees"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const PartnerWelcome = lazy(() => import("./pages/PartnerWelcome"));
const SalesSequence = lazy(() => import("./pages/resources/SalesSequence"));
const GrowthThroughService = lazy(() => import("./pages/resources/GrowthThroughService"));
const OperatingSystem = lazy(() => import("./pages/resources/OperatingSystem"));
const Training = lazy(() => import("./pages/resources/Training"));
const MakingItRain = lazy(() => import("./pages/resources/MakingItRain"));
const Being = lazy(() => import("./pages/resources/Being"));
const Body = lazy(() => import("./pages/resources/Body"));
const Balance = lazy(() => import("./pages/resources/Balance"));
const FundingTheBuild = lazy(() => import("./pages/resources/FundingTheBuild"));
const PartnerHubGuide = lazy(() => import("./pages/PartnerHubGuide"));
const FormulaAppGuide = lazy(() => import("./pages/FormulaAppGuide"));
const TestimonialStory = lazy(() => import("./pages/TestimonialStory"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HelmetProvider>
          <GA4Script />
        <BrowserRouter>
          <AuthProvider>
          <AnalyticsListener />
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/speakers" element={<Navigate to="/agenda" replace />} />
            <Route path="/format" element={<Format />} />
            <Route path="/venue" element={<Venue />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/partner" element={<Navigate to="/partners" replace />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/partners/partner-hub-guide" element={<PartnerHubGuide />} />
            <Route path="/formula-app-guide" element={<FormulaAppGuide />} />
            <Route path="/2025partners" element={<Navigate to="/partners" replace />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/vip" element={<VIP />} />
            <Route path="/register" element={<Navigate to="/pricing" replace />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/thank-you" element={<ThankYouEnhanced />} />
            <Route path="/ga-setup" element={<GASetup />} />
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin/registrations" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminRegistrations />
              </ProtectedRoute>
            } />
            <Route path="/admin/sales" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminSales />
              </ProtectedRoute>
            } />
            <Route path="/admin/formula-attendees" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminFormulaAttendees />
              </ProtectedRoute>
            } />
            <Route path="/partner-welcome/:tier" element={<PartnerWelcome />} />
            <Route path="/resources/sales-sequence" element={<SalesSequence />} />
            <Route path="/resources/growth-through-service" element={<GrowthThroughService />} />
            <Route path="/resources/operating-system" element={<OperatingSystem />} />
            <Route path="/resources/training" element={<Training />} />
            <Route path="/resources/making-it-rain" element={<MakingItRain />} />
            <Route path="/resources/being" element={<Being />} />
            <Route path="/resources/body" element={<Body />} />
            <Route path="/resources/balance" element={<Balance />} />
            <Route path="/resources/funding-the-build" element={<FundingTheBuild />} />
            <Route path="/stories/:slug" element={<TestimonialStory />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
           </Routes>
           </Suspense>
           {/* Footer hidden on homepage, visible on other pages */}
            <DeferredScripts />
          </AuthProvider>
        </BrowserRouter>
      </HelmetProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
