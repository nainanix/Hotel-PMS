import Popover from '../ui/Popover'

function ContactPopover({ onClose }) {
  return (
    <Popover title="Contact Us" onClose={onClose} className="right-0 top-full mt-2">
      <div className="flex flex-col gap-3 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-navy-300 dark:text-navy-400">Front Desk</p>
          <p className="mt-0.5 font-medium text-navy-600 dark:text-navy-50">+1 (555) 010-2020</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-navy-300 dark:text-navy-400">Email</p>
          <p className="mt-0.5 font-medium text-navy-600 dark:text-navy-50">frontdesk@evotel.com</p>
        </div>
        <p className="text-xs text-navy-300 dark:text-navy-500">Available 24/7 for reservations and guest support.</p>
      </div>
    </Popover>
  )
}

export default ContactPopover
