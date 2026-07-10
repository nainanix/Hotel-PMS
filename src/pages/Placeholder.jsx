import EmptyState from '../components/ui/EmptyState'

// Shared stand-in for sidebar sections that are wired up (routable, listed
// in navigation) but not built out yet — feeds title/description/icon per
// route rather than duplicating a near-identical page per section.
function Placeholder({ icon, title, description }) {
  return <EmptyState icon={icon} title={`${title} coming soon`} description={description} />
}

export default Placeholder
