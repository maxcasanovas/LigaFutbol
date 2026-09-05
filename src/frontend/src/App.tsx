import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PaisesPage } from './pages/PaisesPage';
import { CiudadesPage } from './pages/CiudadesPage';
import { LigasPage } from './pages/LigasPage';
import { EquiposPage } from './pages/EquiposPage';
import { GestionUsuariosPage } from './pages/GestionUsuariosPage';

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
          <Route element={<ProtectedRoute roles={['Admin']} />}>
            <Route path="/usuarios" element={<GestionUsuariosPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
