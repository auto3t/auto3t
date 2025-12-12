import { useEffect, useState } from 'react'
import useApi from '../hooks/api'
import { TargetBitrateType } from './settings/TargetBitrate'
import { LucideIconWrapper, P, Select } from './Typography'

interface AddTargetBitrateComponentInterface {
  patchURL: string
  refreshCallback: () => void
  canDelete: boolean
  defaultTarget?: TargetBitrateType | null
}

const AddTargetBitrateComponent: React.FC<
  AddTargetBitrateComponentInterface
> = ({ patchURL, refreshCallback, canDelete, defaultTarget = null }) => {
  const { get, patch } = useApi()
  const [targetBitrates, setTargetBitrates] = useState<TargetBitrateType[]>([])
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [editTarget, setEditTarget] = useState<boolean>(false)

  useEffect(() => {
    const getTargets = async () => {
      const targets = (await get(
        'targetbitrates/?exclude-default=true',
      )) as TargetBitrateType[]
      setTargetBitrates(targets)
    }
    getTargets()
  }, [defaultTarget])

  const handleOptionUpdate = async () => {
    await patch(patchURL, {
      target_bitrate: selectedOption === '' ? null : Number(selectedOption),
    })
    setSelectedOption('')
    setEditTarget(false)
    refreshCallback()
  }

  return (
    <>
      {(defaultTarget?.movie_default || defaultTarget?.tv_default) && (
        <div className="flex gap-2">
          <P className="mb-2">{defaultTarget.bitrate_str}</P>
          {targetBitrates.length > 0 && (
            <LucideIconWrapper
              name="Pencil"
              className="cursor-pointer"
              onClick={() => setEditTarget(!editTarget)}
            />
          )}
        </div>
      )}
      {(editTarget || (targetBitrates.length > 0 && canDelete)) && (
        <div className="flex gap-2 items-center">
          <Select
            onChange={(e) => setSelectedOption(e.target.value)}
            value={
              selectedOption || (canDelete ? defaultTarget?.id.toString() : '')
            }
          >
            <option key="" value="">
              ---
            </option>
            {targetBitrates.map((targetBitrate) => (
              <option key={targetBitrate.id} value={targetBitrate.id}>
                {targetBitrate.bitrate_str}
              </option>
            ))}
          </Select>
          <div className="flex gap-2">
            {selectedOption && (
              <LucideIconWrapper
                name="Check"
                colorClassName="text-green-700 cursor-pointer"
                onClick={handleOptionUpdate}
              />
            )}
            {canDelete && (
              <LucideIconWrapper
                name="X"
                className="cursor-pointer"
                onClick={() => {
                  setSelectedOption('')
                  handleOptionUpdate()
                }}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default AddTargetBitrateComponent
