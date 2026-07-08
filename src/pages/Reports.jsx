import { BarChart3 } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'

function Reports() {
  return (
    <EmptyState
      icon={BarChart3}
      title="Reports coming soon"
      description="Performance and revenue reporting."
    />
  )
}

export default Reports
