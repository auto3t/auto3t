import { useEffect, useCallback, useState } from 'react'
import useCategoryFormStore from '../stores/CategoryFormStore'
import useSearchKeyWordStore from '../stores/SearchKeyWordsStore'
import useApi from '../hooks/api'
import { Button, H2, Input, Select, Table } from './Typography'

export type KeywordType = {
  id: number
  category: string
  category_name?: string
  direction_display?: string
  word: string
  direction: string
  movie_default: boolean
  tv_default: boolean
}

export default function Keywords() {
  const { get, post, put, del } = useApi()

  const { categories } = useCategoryFormStore()
  const {
    keywords,
    setKeywords,
    createKeyword,
    setCreateKeyword,
    deletingKeyword,
    setDeletingKeyword,
    editingKeyword,
    setEditingKeyword,
    newKeyword,
    setNewKeyword,
    selectedCategory,
    setSelectedCategory,
    direction,
    setDirection,
    isDefaultTV,
    setIsDefaultTV,
    isDefaultMovie,
    setIsDefaultMovie,
  } = useSearchKeyWordStore()

  const [editedKeyword, setEditedKeyword] = useState<KeywordType>({
    id: 0,
    category: '',
    word: '',
    direction: 'i',
    movie_default: false,
    tv_default: false,
  })

  const fetchKeywords = useCallback(async () => {
    const data = await get('keyword/')
    setKeywords(data)
  }, [setKeywords])

  useEffect(() => {
    fetchKeywords()
  }, [fetchKeywords])

  const resetFormDefaults = () => {
    setNewKeyword('')
    setSelectedCategory('')
    setDirection('i')
    setIsDefaultTV(false)
    setIsDefaultMovie(false)
  }

  const handleNewKeywordSubmit = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault()
    try {
      const body = {
        category: selectedCategory,
        word: newKeyword,
        direction: direction,
        movie_default: isDefaultMovie,
        tv_default: isDefaultTV,
      }
      const data = await post('keyword/', body)
      if (data) {
        resetFormDefaults()
        setCreateKeyword(false)
        fetchKeywords()
      } else {
        console.error('Failed to create keyword')
      }
    } catch (error) {
      console.error('Error creating keyword:', error)
    }
  }

  const handleDeleteKeyword = (keyword: KeywordType) => {
    setDeletingKeyword(keyword)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingKeyword) return
    try {
      const data = await del(`keyword/${deletingKeyword.id}/`)
      if (data) {
        setDeletingKeyword(null)
        fetchKeywords()
      } else {
        console.error('Failed to delete keyword')
      }
    } catch (error) {
      console.error('Error deleting keyword:', error)
    }
  }

  const handleCancelDelete = () => {
    setDeletingKeyword(null)
  }

  const handleEditKeyword = (keyword: KeywordType) => {
    setEditingKeyword(keyword)
    setEditedKeyword({
      id: keyword.id,
      category: keyword.category,
      word: keyword.word,
      direction: keyword.direction,
      movie_default: keyword.movie_default,
      tv_default: keyword.tv_default,
    })
  }

  const handleEditCancel = () => {
    setEditingKeyword(null)
  }

  const handleEditSubmit = async () => {
    if (!editingKeyword) return
    try {
      const data = await put(`keyword/${editingKeyword.id}/`, editedKeyword)
      if (data) {
        setEditingKeyword(null)
        fetchKeywords()
      } else {
        console.error('Failed to update keyword')
      }
    } catch (error) {
      console.error('Error updating keyword:', error)
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target
    const val = type === 'checkbox' ? checked : value
    setEditedKeyword((prevState) => ({
      ...prevState,
      [name]: val,
    }))
  }

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target
    setEditedKeyword((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleShowAddForm = () => {
    setCreateKeyword(true)
  }

  const handleCancelCreate = () => {
    setCreateKeyword(false)
    resetFormDefaults()
  }

  const headers = [
    'Category',
    'Keyword',
    'Direction',
    'Default TV',
    'Default Movie',
    createKeyword === true ? (
      <Button onClick={handleCancelCreate}>Cancel</Button>
    ) : (
      <Button onClick={handleShowAddForm}>Add</Button>
    ),
  ]

  const rowsHead: (string | number | React.ReactNode)[][] = []
  if (createKeyword === true) {
    rowsHead.push([
      <Select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        key="keyword-create-category-select"
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>,
      <Input
        type="text"
        value={newKeyword}
        onChange={(e) => setNewKeyword(e.target.value)}
        placeholder="Enter keyword"
        key="keyword-create-keyword-input"
      />,
      <Select
        value={direction}
        onChange={(e) => setDirection(e.target.value)}
        key="keyword-create-direction-select"
      >
        <option value="i">Include</option>
        <option value="e">Exclude</option>
      </Select>,
      <Input
        type="checkbox"
        checked={isDefaultTV}
        onChange={(e) => setIsDefaultTV(e.target.checked)}
        key="keyword-create-default-tv-input"
      />,
      <Input
        type="checkbox"
        checked={isDefaultMovie}
        onChange={(e) => setIsDefaultMovie(e.target.checked)}
        key="keyword-create-default-movie-input"
      />,
      <Button onClick={handleNewKeywordSubmit} key="keyword-create-button">
        Create Keyword
      </Button>,
    ])
  }

  const rows = rowsHead.concat(
    keywords.map((keyword) => {
      const isEditing = keyword === editingKeyword

      if (isEditing) {
        return [
          <Select
            name="category"
            value={editedKeyword.category}
            onChange={handleSelectChange}
            key={`editing-category-${keyword.id}`}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>,
          <Input
            type="text"
            name="word"
            value={editedKeyword.word}
            onChange={handleInputChange}
            key={`editing-word-${keyword.id}`}
          />,
          <Select
            name="direction"
            value={editedKeyword.direction}
            onChange={handleSelectChange}
            key={`editing-direction-${keyword.id}`}
          >
            <option value="i">Include</option>
            <option value="e">Exclude</option>
          </Select>,
          <Input
            type="checkbox"
            name="tv_default"
            checked={editedKeyword.tv_default}
            onChange={handleInputChange}
            key={`editing-default-tv-${keyword.id}`}
          />,
          <Input
            type="checkbox"
            name="movie_default"
            checked={editedKeyword.movie_default}
            onChange={handleInputChange}
            key={`editing-default-movie-${keyword.id}`}
          />,
          <>
            <Button type="button" onClick={handleEditSubmit}>
              Update
            </Button>
            <Button className="ml-2" type="button" onClick={handleEditCancel}>
              Cancel
            </Button>
          </>,
        ]
      }

      // is not editing
      return [
        keyword.category_name,
        keyword.word,
        keyword.direction_display,
        keyword.tv_default ? '✅' : '-',
        keyword.movie_default ? '✅' : '-',

        deletingKeyword === keyword ? (
          <>
            <Button onClick={handleDeleteConfirm}>Confirm</Button>
            <Button className="ml-2" onClick={handleCancelDelete}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => handleEditKeyword(keyword)}>Edit</Button>
            <Button
              className="ml-2"
              onClick={() => handleDeleteKeyword(keyword)}
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
      <H2>Search Key Words</H2>
      <Table headers={headers} rows={rows} className="w-full" />
    </>
  )
}
