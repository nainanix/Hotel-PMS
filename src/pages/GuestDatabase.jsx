import { useMemo, useState } from 'react'
import Tabs from '../components/ui/Tabs'
import SearchInput from '../components/ui/SearchInput'
import Badge from '../components/ui/Badge'
import { Table, Th, Td } from '../components/ui/Table'
import { getGuestsWithResidenceStatus } from '../data/api'
import { formatDateLong } from '../utils/dates'

const FILTERS = {
  all: () => true,
  vip: (g) => g.status === 'VIP',
  'in-residence': (g) => g.inResidence,
  corporate: (g) => g.status === 'Corporate',
}

function GuestDatabase() {
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')

  const guests = useMemo(() => getGuestsWithResidenceStatus(), [])

  const tabs = [
    { key: 'all', label: 'All Guests', count: guests.length },
    { key: 'vip', label: 'VIP Members', count: guests.filter(FILTERS.vip).length },
    { key: 'in-residence', label: 'In Residence', count: guests.filter(FILTERS['in-residence']).length },
    { key: 'corporate', label: 'Corporate Accounts', count: guests.filter(FILTERS.corporate).length },
  ]

  const filtered = guests.filter(FILTERS[activeTab]).filter((g) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return g.name.toLowerCase().includes(q) || g.email.toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search name or email"
          className="w-72"
        />
      </div>

      <Table>
        <thead>
          <tr>
            <Th>Guest Name</Th>
            <Th>Contact Details</Th>
            <Th>Status</Th>
            <Th>Last Stay</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((guest) => (
            <tr key={guest.id} className="hover:bg-surface-muted/60">
              <Td className="font-medium text-navy-600 dark:text-navy-50">
                {guest.name}
                {guest.inResidence && (
                  <span className="ml-2 text-xs font-normal text-gold-600 dark:text-gold-400">In Residence</span>
                )}
              </Td>
              <Td>
                <div className="flex flex-col">
                  <span>{guest.email}</span>
                  <span className="text-xs text-navy-300 dark:text-navy-500">{guest.phone}</span>
                </div>
              </Td>
              <Td>
                <Badge status={guest.status} />
              </Td>
              <Td>
                {guest.lastStay ? (
                  formatDateLong(guest.lastStay)
                ) : (
                  <span className="text-navy-300 dark:text-navy-500">No stays yet</span>
                )}
              </Td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <Td className="py-8 text-center text-navy-300 dark:text-navy-500" colSpan={4}>
                No guests found.
              </Td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  )
}

export default GuestDatabase
