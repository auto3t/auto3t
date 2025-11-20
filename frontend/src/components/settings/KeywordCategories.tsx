import { useEffect, useCallback } from 'react'
import useCategoryFormStore from '../../stores/CategoryFormStore'
import useApi from '../../hooks/api'
import { H2, Input, LucideIconWrapper, Table } from '../Typography'

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

  const handleNewCategorySubmit = async () => {
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
      <LucideIconWrapper
        name="Plus"
        onClick={handleShowCreateForm}
        className="cursor-pointer bg-main-fg rounded-lg p-2 w-fit"
        title="Add new category"
      />
    ) : (
      <LucideIconWrapper
        name="X"
        onClick={handleCancelCreate}
        className="cursor-pointer bg-main-fg rounded-lg p-2 w-fit"
        title="Cancel add new category"
      />
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
      <LucideIconWrapper
        name="Check"
        onClick={handleNewCategorySubmit}
        key="new-category-button"
        className="cursor-pointer"
        colorClassName="text-green-700"
        title="Confirm create"
      />,
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
          <div className="flex gap-2" key="editing-key-word-category">
            <LucideIconWrapper
              name="X"
              onClick={handleCancelEdit}
              className="cursor-pointer"
              title="Cancel editing"
            />
            <LucideIconWrapper
              name="Check"
              onClick={handleUpdateCategory}
              className="cursor-pointer"
              colorClassName="text-green-700"
              title="Update category"
            />
          </div>,
        ]
      }

      // is not editiong
      return [
        category.name,
        deletingCategory === category ? (
          <div className="flex gap-2">
            <LucideIconWrapper
              name="Check"
              onClick={handleDeleteConfirm}
              className="cursor-pointer"
              colorClassName="text-green-700"
              title="Confirm delete category"
            />
            <LucideIconWrapper
              name="X"
              onClick={handleCancelDelete}
              className="cursor-pointer"
              title="Cancel delete category"
            />
          </div>
        ) : (
          <div className="flex gap-2">
            <LucideIconWrapper
              name="Pencil"
              onClick={() => handleEditCategory(category)}
              className="cursor-pointer"
              title="Edit category"
            />
            <LucideIconWrapper
              name="Trash2"
              onClick={() => handleDeleteCategory(category)}
              className="cursor-pointer"
              title="Delete category"
            />
          </div>
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
