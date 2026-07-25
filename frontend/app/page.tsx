import { Dashboard } from '@/components/dashboard'
import { RequireAuth } from '@/components/require-auth'

export default function Home() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  )
}
