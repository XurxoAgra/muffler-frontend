import { Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from '../ui/Sidebar'
import { Header } from './Header'
import { ProfileProvider } from '../../profile/ProfileContext'
import { FleetDataProvider, useFleetData } from '../../vehicles/FleetDataContext'
import { useAuth } from '../../auth/AuthContext'
import { deriveUpcoming, countOverdue } from '../../lib/fleetInsights'

function ShellChrome() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { vehicles, recordsByVehicle } = useFleetData()
  const [loggingOut, setLoggingOut] = useState(false)

  const overdueCount = vehicles ? countOverdue(deriveUpcoming(vehicles, recordsByVehicle)) : undefined

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-svh w-full justify-center bg-page p-2.5 md:p-6">
      <div className="flex w-full flex-col gap-2.5 rounded-3xl bg-shell p-2.5 shadow-2xl md:flex-row md:gap-4 md:p-4">
        <Sidebar vehicleCount={vehicles?.length} overdueCount={overdueCount} onLogout={handleLogout} loggingOut={loggingOut} />

        <main className="min-w-0 flex-1 rounded-[22px] bg-main p-4 sm:p-7 md:rounded-[26px] md:p-8">
          <Header />
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function Shell() {
  return (
    <ProfileProvider>
      <FleetDataProvider>
        <ShellChrome />
      </FleetDataProvider>
    </ProfileProvider>
  )
}
