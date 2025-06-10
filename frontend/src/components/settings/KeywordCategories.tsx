import { useEffect, useCallback } from 'react'
import useCategoryFormStore from '../../stores/CategoryFormStore'
import useApi from '../../hooks/api'
import { Button, H2, Input, Table } from '../Typography'

export type KeyWordCategoryType = {
  id: number
  name: string
}

export default function KeywordCategories() {
  const { get, post, put, del } = useApi()

  const {
    categories,
    setCategories,
    createCategory,
    setCreateCategory,
    newCategoryName,
    setNewCategoryName,
    deletingCategory,
    setDeletingCategory,
    editingCategory,
    setEditingCategory,
    editedCategoryName,
    setEditedCategoryName,
  } = useCategoryFormStore()

  const fetchCategories = useCallback(async () => {
    const data = await get('keyword-category/')
    setCategories(data)
  }, [setCategories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleNewCategorySubmit = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()
    try {
      const data = await post('keyword-category/', { name: newCategoryName })
      if (data) {
        setNewCategoryName('')
        setCreateCategory(false)
        fetchCategories()
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleEditCategory = (category: KeyWordCategoryType) => {
    setEditingCategory(category)
    setEditedCategoryName(category.name)
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return
    try {
      const data = await put(`keyword-category/${editingCategory.id}/`, {
        name: editedCategoryName,
      })
      if (data) {
        setEditingCategory(null)
        fetchCategories()
      } else {
        console.error('Failed to update category')
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditedCategoryName('')
  }

  const handleDeleteCategory = (category: KeyWordCategoryType) => {
    setDeletingCategory(category)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return
    try {
      const data = await del(`keyword-category/${deletingCategory.id}/`)
      if (data) {
        setDeletingCategory(null)
        fetchCategories()
      } else {
        console.error('Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleCancelDelete = () => {
    setDeletingCategory(null)
  }

  const handleShowCreateForm = () => {
    setCreateCategory(true)
  }

  const handleCancelCreate = () => {
    setNewCategoryName('')
    setCreateCategory(false)
  }

  const headers = [
    'Name',
    createCategory === false ? (
      <Button onClick={handleShowCreateForm}>Add</Button>
    ) : (
      <Button className="ml-2" onClick={handleCancelCreate}>
        Cancel
      </Button>
    ),
  ]

  const rowsHead: (string | number | React.ReactNode)[][] = []

  if (createCategory === true) {
    rowsHead.push([
      <Input
        type="text"
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        placeholder="Enter category name"
        key="new-category-input"
      />,
      <Button onClick={handleNewCategorySubmit} key="new-category-button">
        Create Category
      </Button>,
    ])
  }

  const rows = rowsHead.concat(
    categories.map((category) => {
      const isEditing = category === editingCategory

      if (isEditing) {
        return [
          <Input
            type="text"
            value={editedCategoryName}
            onChange={(e) => setEditedCategoryName(e.target.value)}
            key={`editing-category-${category.id}`}
          />,
          <>
            <Button onClick={handleCancelEdit}>Cancel</Button>
            <Button className="ml-2" onClick={handleUpdateCategory}>
              Update
            </Button>
          </>,
        ]
      }

      // is not editiong
      return [
        category.name,
        deletingCategory === category ? (
          <>
            <Button onClick={handleDeleteConfirm}>Confirm</Button>
            <Button className="ml-2" onClick={handleCancelDelete}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => handleEditCategory(category)}>Edit</Button>
            <Button
              className="ml-2"
              onClick={() => handleDeleteCategory(category)}
            >
              Delete
            </Button>
          </>
        ),
      ]
    }),
  )

  return (
    <>
      <H2>Categories</H2>
      <Table headers={headers} rows={rows} />
    </>
  )
}
