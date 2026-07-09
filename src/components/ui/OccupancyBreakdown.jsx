function OccupancyBreakdown({ breakdown }) {
  const sections = [
    { label: 'Occupied', items: breakdown.occupied, render: (r) => r.guestName },
    { label: 'Available', items: breakdown.available, render: () => 'Ready for booking' },
    { label: 'Maintenance', items: breakdown.maintenance, render: (r) => r.note || 'Out of service' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <div key={section.label}>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-navy-300 dark:text-navy-500">
            {section.label} ({section.items.length})
          </p>
          {section.items.length === 0 ? (
            <p className="text-xs text-navy-300 dark:text-navy-500">None</p>
          ) : (
            <div className="flex flex-col divide-y divide-navy-100 rounded-xl border border-navy-100 dark:divide-navy-700 dark:border-navy-700">
              {section.items.map((room, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-4 py-2.5">
                  <div>
                    <p className="text-navy-500 dark:text-navy-300">Room {room.roomNumber}</p>
                    <p className="text-xs text-navy-300 dark:text-navy-500">{room.roomType}</p>
                  </div>
                  <span className="text-sm font-medium text-navy-600 dark:text-navy-50">{section.render(room)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default OccupancyBreakdown
