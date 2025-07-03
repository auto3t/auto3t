import { useEffect, useState } from 'react'
import { Button, H2, Input, P, Table } from '../Typography'
import useApi from '../../hooks/api'

type TargetReleaseType = {
  release_target: number
  release_label: string
  days_delay: number | null
  tracking: boolean
}

export default function MovieReleaseTarget() {
  const { get, post } = useApi()
  const [releaseTargets, setReleaseTargets] = useState<TargetReleaseType[]>([])
  const [editingTargets, setEditingTargets] = useState<TargetReleaseType[]>([])
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    const fetchTargets = async function () {
      const data = (await get('movie/release-target/')) as TargetReleaseType[]
      setReleaseTargets(data)
      setEditingTargets(data)
    }
    fetchTargets()
  }, [setReleaseTargets])

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditingTargets(releaseTargets)
  }

  const handleIsTrackingUpdate = (
    release_target: number,
    tracking: boolean,
  ) => {
    setEditingTargets((prevItems) =>
      prevItems.map((releaseTarget) =>
        releaseTarget.release_target === release_target
          ? { ...releaseTarget, tracking: tracking }
          : releaseTarget,
      ),
    )
  }

  const handleDaysUpdate = (release_target: number, days_delay: number) => {
    setEditingTargets((prevItems) =>
      prevItems.map((releaseTarget) =>
        releaseTarget.release_target === release_target
          ? { ...releaseTarget, days_delay: days_delay || null }
          : releaseTarget,
      ),
    )
  }

  const handleSave = async () => {
    const updatedTargets = await post('movie/release-target/', editingTargets)
    if (updatedTargets) {
      setReleaseTargets(updatedTargets)
      setEditingTargets(updatedTargets)
    }
    setIsEditing(false)
  }

  const headers = [
    'Name',
    'Tracking',
    'Days Delay',
    isEditing ? (
      <>
        <Button onClick={handleCancelEdit}>Cancel</Button>
        {releaseTargets !== editingTargets && (
          <Button className="ml-2" onClick={handleSave}>
            Save
          </Button>
        )}
      </>
    ) : (
      <Button onClick={() => setIsEditing(true)}>Edit</Button>
    ),
  ]

  const rows = editingTargets.map((releaseTarget) => [
    <P key={releaseTarget.release_target}>{releaseTarget.release_label}</P>,
    isEditing ? (
      <Input
        type="checkbox"
        key={releaseTarget.release_target}
        checked={releaseTarget.tracking}
        onChange={(e) =>
          handleIsTrackingUpdate(releaseTarget.release_target, e.target.checked)
        }
      />
    ) : (
      <P key={releaseTarget.release_target}>
        {releaseTarget.tracking ? '✅' : '-'}
      </P>
    ),
    isEditing ? (
      <Input
        type="number"
        key={releaseTarget.release_target}
        value={releaseTarget.days_delay || 0}
        onChange={(e) =>
          handleDaysUpdate(releaseTarget.release_target, Number(e.target.value))
        }
      />
    ) : (
      <P>{releaseTarget.days_delay ? releaseTarget.days_delay : '-'}</P>
    ),
  ])

  return (
    <>
      <H2>Movie Release Target</H2>
      <Table headers={headers} rows={rows} />
    </>
  )
}
