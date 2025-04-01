import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import DocumentView from "./pages/DocumentView";
import People from "./pages/People";
import Organizations from "./pages/Organizations";
import Locations from "./pages/Locations";
import Settings from "./pages/Settings";
import PersonDetail from "./pages/PersonDetail";
import OrganizationDetail from "./pages/OrganizationDetail";
import LocationDetail from "./pages/LocationDetail";
import CalendarView from "./pages/CalendarView";
import Login from "./pages/Login";
import "./App.css";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="proyecto-theme">
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/document/:id" element={<DocumentView />} />
              <Route path="/people" element={<People />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/persona/:id" element={<PersonDetail />} />
              <Route path="/organizacion/:id" element={<OrganizationDetail />} />
              <Route path="/ubicacion/:id" element={<LocationDetail />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;