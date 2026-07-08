import { Settings as SettingsIcon } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'

function Settings() {
  return (
    <EmptyState
      icon={SettingsIcon}
      title="Settings coming soon"
      description="Property settings and user management."
    />
  )
}

export default Settings
