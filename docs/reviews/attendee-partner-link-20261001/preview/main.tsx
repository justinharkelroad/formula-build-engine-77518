import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import AdminFormulaAttendees from '@/pages/AdminFormulaAttendees';
import { Toaster } from '@/components/ui/toaster';
import '@/index.css';
createRoot(document.getElementById('root')!).render(<HelmetProvider><BrowserRouter>
  <div className="bg-orange-100 px-6 py-2 text-sm font-medium text-black">Local preview · example data · no production account changes</div>
  <AdminFormulaAttendees/><Toaster/>
</BrowserRouter></HelmetProvider>);
