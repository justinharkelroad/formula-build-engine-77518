import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Partners from "./pages/Partners";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import SpeakersPage from "./pages/SpeakersPage";
import Agenda from "./pages/Agenda";
import Format from "./pages/Format";
import Venue from "./pages/Venue";
import Survey from "./pages/Survey";
import FAQ from "./pages/FAQ";
import Register from "./pages/Register";
import PaymentSuccess from "./pages/PaymentSuccess";
import ThankYou from "./pages/ThankYou";
import GASetup from "./pages/GASetup";
import ThankYouEnhanced from "./pages/ThankYouEnhanced";
import AdminRegistrations from "./pages/AdminRegistrations";
import AdminMetrics from "./pages/AdminMetrics";
import AdminAuth from "./pages/AdminAuth";
import DeferredScripts from "./components/DeferredScripts";
import GA4Script from "./components/GA4Script";
import AnalyticsListener from "./components/AnalyticsListener";
import Footer from "./components/Footer";

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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/speakers" element={<SpeakersPage />} />
            <Route path="/format" element={<Format />} />
            <Route path="/venue" element={<Venue />} />
            <Route path="/survey" element={<Survey />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/thank-you" element={<ThankYouEnhanced />} />
            <Route path="/ga-setup" element={<GASetup />} />
            <Route path="/admin/auth" element={<AdminAuth />} />
            <Route path="/admin/registrations" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminRegistrations />
              </ProtectedRoute>
            } />
            <Route path="/admin/metrics" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminMetrics />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
           </Routes>
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