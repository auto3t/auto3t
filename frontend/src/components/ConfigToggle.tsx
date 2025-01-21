import React from 'react'

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
      className={`toggle-container ${value ? 'toggle-on' : 'toggle-off'}`}
      onClick={handleToggle}
    >
      <div className={`toggle-circle ${value ? 'circle-on' : 'circle-off'}`} />
    </div>
  )
}

export default ToggleSwitch
