function Dot({ color, glyphColor, glyph, onClick, disabled, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="group relative h-3 w-3 rounded-full transition-transform hover:scale-110 disabled:opacity-40"
      style={{ backgroundColor: color }}
    >
      <span
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-[8px] font-bold leading-none opacity-0 group-hover:opacity-100"
        style={{ color: glyphColor }}
      >
        {glyph}
      </span>
    </button>
  )
}

function WindowDots({ onClose, onMinimize, onMaximize }) {
  return (
    <div className="flex items-center gap-2">
      <Dot color="#ff5f57" glyphColor="#4d0000" glyph="×" onClick={onClose} label="Close" />
      <Dot
        color="#febc2e"
        glyphColor="#7a4b00"
        glyph="−"
        onClick={onMinimize}
        disabled={!onMinimize}
        label="Minimize"
      />
      <Dot
        color="#28c840"
        glyphColor="#0a4d14"
        glyph="+"
        onClick={onMaximize}
        disabled={!onMaximize}
        label="Maximize"
      />
    </div>
  )
}

export default WindowDots
