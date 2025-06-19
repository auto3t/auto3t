import { useEffect, useState } from 'react'
import useApi from '../hooks/api'
import { TargetBitrateType } from './settings/TargetBitrate'
import { Button, Select } from './Typography'

interface AddTargetBitrateComponentInterface {
  patchURL: string
  refreshCallback: () => void
  defaultTarget?: TargetBitrateType | null
}

const AddTargetBitrateComponent: React.FC<
  AddTargetBitrateComponentInterface
> = ({ patchURL, refreshCallback, defaultTarget = null }) => {
  const { get, patch } = useApi()
  const [targetBitrates, setTargetBitrates] = useState<TargetBitrateType[]>([])
  const [selectedOption, setSelectedOption] = useState<string>('')

  useEffect(() => {
    const getTargets = async () => {
      const targets = (await get('targetbitrates/')) as TargetBitrateType[]
      setTargetBitrates(targets)
    }
    getTargets()
  }, [defaultTarget])

  const handleOptionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(event.target.value)
  }

  const handleOptionUpdate = async () => {
    await patch(patchURL, {
      target_bitrate: selectedOption === '' ? null : Number(selectedOption),
    })
    setSelectedOption('')
    refreshCallback()
  }

  const handleReset = async () => {
    setSelectedOption('')
    handleOptionUpdate()
  }

  return (
    <>
      {targetBitrates && (
        <>
          <Select
            onChange={handleOptionSelect}
            value={defaultTarget ? defaultTarget.id.toString() : ''}
          >
            {defaultTarget === null && <option value="">---</option>}
            {targetBitrates.map((targetBitrate) => (
              <option key={targetBitrate.id} value={targetBitrate.id}>
                {targetBitrate.bitrate_str}
              </option>
            ))}
          </Select>
          {selectedOption && (
            <Button className="ml-2" onClick={handleOptionUpdate}>
              Update
            </Button>
          )}
          {defaultTarget?.movie_default === false && (
            <Button onClick={handleReset} className="ml-2">
              Reset
            </Button>
          )}
        </>
      )}
    </>
  )
}

export default AddTargetBitrateComponent
