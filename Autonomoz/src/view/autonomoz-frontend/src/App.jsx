import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { DialogProvider } from './contexts/DialogContext';
import { SidebarProvider } from './contexts/SidebarContext';

import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EstoquePage from './pages/EstoquePage';
import LotesPage from './pages/LotesPage';
import MovimentacoesPage from './pages/MovimentacoesPage';
import CategoriasPage from './pages/CategoriasPage';
import FornecedoresPage from './pages/FornecedoresPage';
import OrdensProducaoPage from './pages/OrdensProducaoPage';
import VendasPage from './pages/VendasPage';
import AlertasPage from './pages/AlertasPage';
import UsuariosPage from './pages/UsuariosPage';
import LogsRelatoriosPage from './pages/LogsRelatoriosPage';

function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isGerente, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-primary text-[36px]">
            progress_activity
          </span>
          <span className="font-label-code text-secondary text-body-sm">
            Carregando sessão operacional...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'GERENTE' && !isGerente) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <DialogProvider>
            <SidebarProvider>
              <BrowserRouter>
                <Routes>
                  {/* Public Login Route */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Application Routes */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <AppLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="estoque" element={<EstoquePage />} />
                    <Route path="lotes" element={<LotesPage />} />
                    <Route path="rastreabilidade-de-pecas" element={<Navigate to="/lotes" replace />} />
                    <Route path="movimentacoes" element={<MovimentacoesPage />} />
                    <Route path="categorias" element={<CategoriasPage />} />
                    <Route path="fornecedores" element={<FornecedoresPage />} />
                    <Route path="ordens-producao" element={<OrdensProducaoPage />} />
                    <Route path="ordens-de-producao" element={<Navigate to="/ordens-producao" replace />} />
                    <Route
                      path="vendas"
                      element={
                        <ProtectedRoute requiredRole="GERENTE">
                          <VendasPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="alertas" element={<AlertasPage />} />
                    <Route
                      path="usuarios"
                      element={
                        <ProtectedRoute requiredRole="GERENTE">
                          <UsuariosPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="relatorios" element={<LogsRelatoriosPage />} />
                    <Route path="configuracoes" element={<Navigate to="/usuarios" replace />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </BrowserRouter>
            </SidebarProvider>
          </DialogProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
