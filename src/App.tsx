
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from '@/layouts/DashboardLayout';
import ProprietarioLayout from '@/layouts/ProprietarioLayout';
import AdminLayout from '@/layouts/AdminLayout';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import ContractsPage from '@/components/ContractsPage';
import ContractTemplates from '@/pages/ContractTemplates';
import NewContract from '@/pages/NewContract';
import Documents from '@/pages/Documents';
import Dashboard from '@/pages/Index';
import ProprietarioDashboard from '@/pages/ProprietarioDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import Landing from '@/pages/Landing';
import DashboardSelection from '@/pages/DashboardSelection';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard-selection" element={<DashboardSelection />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Juridical Dashboard */}
          <Route path="/juridico" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="contracts" element={<ContractsPage />} />
            <Route path="templates" element={<ContractTemplates />} />
            <Route path="new-contract" element={<NewContract />} />
            <Route path="documentos" element={<Documents />} />
          </Route>

          {/* Proprietario Dashboard */}
          <Route path="/proprietario" element={<ProprietarioLayout />}>
            <Route index element={<ProprietarioDashboard />} />
          </Route>

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
