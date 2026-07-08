import { Tag } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'

function Rates() {
  return (
    <EmptyState
      icon={Tag}
      title="Rates coming soon"
      description="Rate plans and pricing management."
    />
  )
}

export default Rates
