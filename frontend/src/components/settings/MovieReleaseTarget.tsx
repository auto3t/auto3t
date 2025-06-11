import { useEffect, useState } from 'react'
import { Button, H2, Input, P, Table } from '../Typography'
import useApi from '../../hooks/api'

type TargetReleaseType = {
  id: number
  name: string
  tracking: boolean
}

export default function MovieReleaseTarget() {
  const { get, post } = useApi()
  const [releaseTargets, setReleaseTargets] = useState<TargetReleaseType[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTargets, setSelectedTargets] = useState(new Set<number>())

  useEffect(() => {
    const fetchTargets = async function () {
      const data = (await get('movie/release-target/')) as TargetReleaseType[]
      const idSet = new Set(
        data.filter((release) => release.tracking).map((release) => release.id),
      )

      setSelectedTargets(idSet)
      setReleaseTargets(data)
    }
    fetchTargets()
  }, [setReleaseTargets])

  const handleCheckboxUpdate = (id: number, checked: boolean) => {
    setSelectedTargets((prev) => {
      const updated = new Set(prev)
      checked ? updated.add(id) : updated.delete(id)
      return updated
    })
  }

  const handleTargetSave = async () => {
    const body = {
      target: Array.from(selectedTargets),
    }
    const data = (await post(
      'movie/release-target/',
      body,
    )) as TargetReleaseType[]
    if (data) {
      setReleaseTargets(data)
      const idSet = new Set(
        data.filter((release) => release.tracking).map((release) => release.id),
      )
      setSelectedTargets(idSet)
      setIsEditing(false)
    } else {
      console.error('failed to update target release')
    }
  }

  const resetSelectedTargets = () => {
    const resetSet = new Set(
      releaseTargets.filter((rt) => rt.tracking).map((rt) => rt.id),
    )
    setSelectedTargets(resetSet)
    setIsEditing(false)
  }

  const headers = [
    'Name',
    isEditing ? (
      <div className="flex gap-2 justify-between">
        <P>Tracking</P>
        <Button onClick={resetSelectedTargets}>Cancel</Button>
        <Button onClick={handleTargetSave}>Save</Button>
      </div>
    ) : (
      <div className="flex gap-2 justify-between">
        <P>Tracking</P>
        <Button onClick={() => setIsEditing(true)}>Edit</Button>
      </div>
    ),
  ]
  const rows = releaseTargets.map((releaseTarget) => [
    <P>{releaseTarget.name}</P>,
    isEditing ? (
      <Input
        type="checkbox"
        checked={selectedTargets.has(releaseTarget.id)}
        key={releaseTarget.id}
        onChange={(e) =>
          handleCheckboxUpdate(releaseTarget.id, e.target.checked)
        }
      />
    ) : (
      <P key={releaseTarget.id}>{releaseTarget.tracking ? '✅' : '-'}</P>
    ),
  ])

  return (
    <>
      <H2>Movie Release Target</H2>
      <Table headers={headers} rows={rows} />
    </>
  )
}
