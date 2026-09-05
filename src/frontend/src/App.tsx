import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PaisesPage } from './pages/PaisesPage';
import { CiudadesPage } from './pages/CiudadesPage';
import { LigasPage } from './pages/LigasPage';
import { EquiposPage } from './pages/EquiposPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/paises" element={<PaisesPage />} />
          <Route path="/ciudades" element={<CiudadesPage />} />
          <Route path="/ligas" element={<LigasPage />} />
          <Route path="/equipos" element={<EquiposPage />} />
          <Route path="/usuarios" element={<PlaceholderPage title="Usuarios" />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
