interface ToggleSwitchProps {
  value: boolean
  onChange: (value: boolean) => void
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ value, onChange }) => {
  const handleToggle = () => {
    onChange(!value)
  }

  return (
    <div
      onClick={handleToggle}
      className={`w-[44px] h-[26px] flex items-center rounded-full relative cursor-pointer transition-colors duration-300 ${
        value ? 'bg-accent-2' : 'bg-main-fg'
      }`}
    >
      <div
        className={`w-[18px] h-[18px] bg-accent-1 rounded-full absolute top-[4px] left-[4px] shadow-md transition-transform duration-300 ${
          value ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
      />
    </div>
  )
}

export default ToggleSwitch
