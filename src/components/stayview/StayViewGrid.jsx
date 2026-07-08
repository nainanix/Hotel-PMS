import { useMemo } from 'react'
import { getStayViewData } from '../../data/api'
import { getDaysInMonth } from '../../utils/dates'
import DateHeaderRow from './DateHeaderRow'
import RoomRow from './RoomRow'
import StayBlock from './StayBlock'

const LABEL_COL_WIDTH = 220
const DAY_COL_WIDTH = 56

function StayViewGrid({ year, month, refreshKey, onCellClick, onBlockClick }) {
  const { rooms, reservations } = useMemo(
    () => getStayViewData(year, month),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, month, refreshKey]
  )
  const daysInMonth = getDaysInMonth(year, month)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const roomIndexById = useMemo(() => new Map(rooms.map((room, i) => [room.id, i])), [rooms])

  const gridTemplateColumns = `${LABEL_COL_WIDTH}px repeat(${daysInMonth}, ${DAY_COL_WIDTH}px)`
  const gridTemplateRows = `56px repeat(${rooms.length}, 64px)`

  return (
    <div className="overflow-x-auto rounded-2xl border border-navy-100 bg-surface shadow-sm dark:border-navy-700">
      <div className="grid" style={{ gridTemplateColumns, gridTemplateRows }}>
        <div
          className="sticky left-0 z-20 flex items-center border-b border-r border-navy-100 bg-surface-muted px-4 text-xs font-semibold uppercase tracking-wide text-navy-300 dark:border-navy-700 dark:text-navy-500"
          style={{ gridColumn: 1, gridRow: 1 }}
        >
          Room
        </div>
        <DateHeaderRow days={days} year={year} month={month} />

        {rooms.map((room, i) => (
          <RoomRow
            key={room.id}
            room={room}
            rowIndex={i + 2}
            daysInMonth={daysInMonth}
            year={year}
            month={month}
            onCellClick={onCellClick}
          />
        ))}

        {rooms
          .filter((room) => room.occupancyStatus === 'maintenance')
          .map((room) => (
            <div
              key={`maintenance-${room.id}`}
              className="m-1.5 flex items-center rounded-md border border-dashed border-status-urgent/40 bg-status-urgent/10 px-2 text-xs font-medium text-status-urgent"
              style={{
                gridColumn: `2 / ${daysInMonth + 2}`,
                gridRow: roomIndexById.get(room.id) + 2,
              }}
            >
              Under maintenance
            </div>
          ))}

        {reservations.map((reservation) => {
          const roomIndex = roomIndexById.get(reservation.roomId)
          if (roomIndex === undefined) return null
          const room = rooms[roomIndex]
          return (
            <StayBlock
              key={reservation.id}
              reservation={reservation}
              rowIndex={roomIndex + 2}
              roomNumber={room.number}
              year={year}
              month={month}
              daysInMonth={daysInMonth}
              onClick={onBlockClick}
            />
          )
        })}
      </div>
    </div>
  )
}

export default StayViewGrid
