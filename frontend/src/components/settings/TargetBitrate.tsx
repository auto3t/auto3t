import { useCallback, useEffect, useState } from 'react'
import { H2, Input, LucideIconWrapper, P, Table } from '../Typography'
import useApi from '../../hooks/api'

type TargetBitrateRelations = {
  movie: number[]
  show: number[]
  season: number[]
  episode: number[]
}

export type TargetBitrateType = {
  id: number
  bitrate: number
  bitrate_str?: string
  plusminus: number
  tv_default: boolean
  movie_default: boolean
  related?: TargetBitrateRelations
}

export default function TargetBitrate() {
  const { get, put, post, del, error } = useApi()
  const [targetBitrates, setTargetBitrates] = useState<TargetBitrateType[]>([])
  const [createNewTarget, setCreateNewTarget] = useState(false)
  const [newBitrate, setNewBitrate] = useState(0)
  const [newPlusMinus, setNewPlusMinus] = useState(0)
  const [newDefaultTV, setNewDefaultTV] = useState(false)
  const [newDefaultMovie, setNewDefaultMovie] = useState(false)

  const editingDefault = {
    id: 0,
    bitrate: 0,
    plusminus: 0,
    tv_default: false,
    movie_default: false,
  }
  const [editingTarget, setEditingTarget] = useState<TargetBitrateType | null>(
    null,
  )
  const [editedTarget, setEditedTarget] =
    useState<TargetBitrateType>(editingDefault)
  const [deletingTarget, setDeletingTarget] =
    useState<TargetBitrateType | null>(null)

  const fetchTargetBitrates = useCallback(async () => {
    try {
      const data = (await get('targetbitrates/')) as TargetBitrateType[]
      setTargetBitrates(data)
    } catch (error) {
      console.error('failed to fetch target bitrates: ', error)
    }
  }, [setTargetBitrates])

  useEffect(() => {
    fetchTargetBitrates()
  }, [fetchTargetBitrates])

  const resetFormDefaults = () => {
    setNewBitrate(0)
    setNewPlusMinus(0)
    setNewDefaultTV(false)
    setNewDefaultMovie(false)
  }

  const handleNewTargetSubmit = async () => {
    try {
      const body = {
        bitrate: newBitrate,
        plusminus: newPlusMinus,
        tv_default: newDefaultTV,
        movie_default: newDefaultMovie,
      }
      const data = await post('targetbitrates/', body)
      if (data) {
        resetFormDefaults()
        setCreateNewTarget(false)
        fetchTargetBitrates()
      } else {
        console.error('failed to create new target')
      }
    } catch (error) {
      console.error('Error creating target: ', error)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    const val = type === 'checkbox' ? checked : value
    setEditedTarget((prevState) => ({
      ...prevState,
      [name]: val,
    }))
  }

  const handleEditCancel = () => {
    setNewBitrate(0)
    setNewPlusMinus(0)
    setNewDefaultTV(false)
    setNewDefaultMovie(false)
    setCreateNewTarget(false)
  }

  const handleEditTarget = (targetBitrate: TargetBitrateType) => {
    setEditingTarget(targetBitrate)
    setEditedTarget({
      id: targetBitrate.id,
      bitrate: targetBitrate.bitrate,
      plusminus: targetBitrate.plusminus,
      tv_default: targetBitrate.tv_default,
      movie_default: targetBitrate.movie_default,
    })
  }

  const handleEditSubmit = async () => {
    if (!editingTarget) return
    try {
      const data = await put(
        `targetbitrates/${editingTarget.id}/`,
        editedTarget,
      )
      if (data) {
        setEditingTarget(null)
        fetchTargetBitrates()
      } else {
        console.error('failed to update target')
      }
    } catch (error) {
      console.error('Error updating target: ', error)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingTarget) return
    try {
      const data = await del(`targetbitrates/${deletingTarget.id}/`)
      if (data) {
        setDeletingTarget(null)
        fetchTargetBitrates()
      } else {
        console.error('failed to delete target')
      }
    } catch (error) {
      console.error('Error deleting target: ', error)
    }
  }

  const headers = [
    'Bitrate Mbps',
    '+/- %',
    'Default TV',
    'Default Movie',
    createNewTarget ? (
      <LucideIconWrapper
        name="X"
        onClick={handleEditCancel}
        className="cursor-pointer bg-main-fg rounded-lg p-2 w-fit"
        title="Cancel add new target bitrate"
      />
    ) : (
      <LucideIconWrapper
        name="Plus"
        onClick={() => setCreateNewTarget(!createNewTarget)}
        className="cursor-pointer bg-main-fg rounded-lg p-2 w-fit"
        title="Add new target bitrate"
      />
    ),
  ]

  const rowsHead: (string | number | React.ReactNode)[][] = []
  if (createNewTarget === true) {
    rowsHead.push([
      <Input
        type="number"
        value={newBitrate}
        onChange={(e) => setNewBitrate(e.target.valueAsNumber)}
        placeholder="Enter new Target Bitrate"
        key="new-target-bitrate"
      />,
      <Input
        type="number"
        value={newPlusMinus}
        onChange={(e) => setNewPlusMinus(e.target.valueAsNumber)}
        placeholder="Plus minus %"
        key="new-plus-minus"
      />,
      <Input
        type="checkbox"
        checked={newDefaultTV}
        onChange={(e) => setNewDefaultTV(e.target.checked)}
        key="new-default-tv"
      />,
      <Input
        type="checkbox"
        checked={newDefaultMovie}
        onChange={(e) => setNewDefaultMovie(e.target.checked)}
        key="new-default-movie"
      />,
      <LucideIconWrapper
        name="Check"
        onClick={handleNewTargetSubmit}
        key="new-button-submit"
        className="cursor-pointer"
        colorClassName="text-green-700"
        title="Confirm create"
      />,
    ])
  }
  const rows = rowsHead.concat(
    targetBitrates.map((targetBitrate) => {
      const isEditing = targetBitrate === editingTarget

      if (isEditing) {
        return [
          <Input
            type="number"
            name="bitrate"
            value={editedTarget.bitrate}
            onChange={handleInputChange}
            key={`editing-target-bitrate-${targetBitrate.id}`}
          />,
          <Input
            type="number"
            name="plusminus"
            value={editedTarget.plusminus}
            onChange={handleInputChange}
            key={`editing-target-plusminus-${targetBitrate.id}`}
          />,
          <Input
            type="checkbox"
            name="tv_default"
            checked={editedTarget.tv_default}
            onChange={handleInputChange}
            key={`editing-target-tv_default-${targetBitrate.id}`}
          />,
          <Input
            type="checkbox"
            name="movie_default"
            checked={editedTarget.movie_default}
            onChange={handleInputChange}
            key={`editing-target-movie_default-${targetBitrate.id}`}
          />,
          <div className="flex gap-2" key="editing-target-bitrate">
            <LucideIconWrapper
              name="X"
              onClick={() => setEditingTarget(editingDefault)}
              className="cursor-pointer"
              title="Cancel editing"
            />
            <LucideIconWrapper
              name="Check"
              onClick={handleEditSubmit}
              className="cursor-pointer"
              colorClassName="text-green-700"
              title="Update target bitrate"
            />
          </div>,
        ]
      }
      // is not editing
      return [
        targetBitrate.bitrate,
        `${targetBitrate.plusminus}%`,
        targetBitrate.tv_default ? '✅' : '-',
        targetBitrate.movie_default ? '✅' : '-',
        deletingTarget === targetBitrate ? (
          <div className="flex gap-2">
            <LucideIconWrapper
              name="Check"
              onClick={handleDeleteConfirm}
              className="cursor-pointer"
              colorClassName="text-green-700"
              title="Confirm delete target bitrate"
            />
            <LucideIconWrapper
              name="X"
              onClick={() => setDeletingTarget(null)}
              className="cursor-pointer"
              title="Cancel delete target bitrate"
            />
          </div>
        ) : (
          <div className="flex gap-2">
            <LucideIconWrapper
              name="Pencil"
              onClick={() => handleEditTarget(targetBitrate)}
              className="cursor-pointer"
              title="Edit target bitrate"
            />
            <LucideIconWrapper
              name="Trash2"
              onClick={() => setDeletingTarget(targetBitrate)}
              className="cursor-pointer"
              title="Delete target bitrate"
            />
          </div>
        ),
      ]
    }),
  )

  return (
    <>
      <H2>Target Bitrate</H2>
      <Table headers={headers} rows={rows} />
      {error && <P>Error: {error}</P>}
    </>
  )
}
