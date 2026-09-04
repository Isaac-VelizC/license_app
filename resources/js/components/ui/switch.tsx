interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative inline-flex h-5 w-9 shrink-0 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" // transition-colors duration-300 ease-in-out
        style={{ backgroundColor: checked ? 'var(--primary)' : 'var(--muted)' }}
        disabled={disabled}
      >
        <span
          className={`${
            checked ? 'translate-x-5 bg-muted' : 'translate-x-1 bg-primary'
          } inline-block h-3 w-3 transform rounded-full  shadow-sm`} // transition duration-300 ease-in-out
        />
      </button>
      {label && <span>{label}</span>}
    </label>
  )
}

export { Switch }
