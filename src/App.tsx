import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { VehiclesPage } from './pages/VehiclesPage'
import { MantenimientoPage } from './pages/MantenimientoPage'
import { Shell } from './components/layout/Shell'
import { ThemeProvider } from './theme/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <RequireAuth>
                  <Shell />
                </RequireAuth>
              }
            >
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/mantenimiento" element={<MantenimientoPage />} />
              <Route path="/mantenimiento/:vehicleId" element={<Navigate to="/mantenimiento" replace />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
