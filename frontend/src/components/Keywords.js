import { useEffect, useCallback, useState } from "react";
import useCategoryFormStore from "../stores/CategoryFormStore";
import useSearchKeyWordStore from "../stores/SearchKeyWordsStore"; 

export default function Keywords() {

  const { categories } = useCategoryFormStore();
  const {
    keywords,
    setKeywords,
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
    isDefault,
    setIsDefault,
  } = useSearchKeyWordStore();

  const [editedKeyword, setEditedKeyword] = useState({
    category: "",
    word: "",
    direction: "i",
    is_default: false
  });

  const fetchKeywords = useCallback(async () => {
    const res = await fetch('http://localhost:8000/api/keyword/');
    const data = await res.json();
    setKeywords(data.results);
  }, [setKeywords]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  const handleNewKeywordSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/keyword/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: selectedCategory,
          word: newKeyword,
          direction: direction,
          is_default: isDefault,
        }),
      });
      if (res.ok) {
        setNewKeyword("");
        setSelectedCategory("");
        setDirection("i");
        setIsDefault(false);
        fetchKeywords();
      } else {
        console.error('Failed to create keyword');
      }
    } catch (error) {
      console.error('Error creating keyword:', error);
    }
  };

  const handleDeleteKeyword = (keyword) => {
    setDeletingKeyword(keyword);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/keyword/${deletingKeyword.id}/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeletingKeyword(null);
        fetchKeywords();
      } else {
        console.error('Failed to delete keyword');
      }
    } catch (error) {
      console.error('Error deleting keyword:', error);
    }
  }

  const handleCancelDelete = () => {
    setDeletingKeyword(null);
  };

  const handleEditKeyword = (keyword) => {
    setEditingKeyword(keyword);
    setEditedKeyword({
      category: keyword.category,
      word: keyword.word,
      direction: keyword.direction,
      is_default: keyword.is_default,
    });
  };

  const handleEditCancel = () => {
    setEditingKeyword(null);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/keyword/${editingKeyword.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedKeyword),
      });
      if (res.ok) {
        setEditingKeyword(null);
        fetchKeywords();
      } else {
        console.error('Failed to update keyword');
      }
    } catch (error) {
      console.error('Error updating keyword:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setEditedKeyword(prevState => ({
      ...prevState,
      [name]: val
    }));
  };

  return (
    <>
      <h1>Search Key Words</h1>
        <h2>Create New Keyword</h2>
        <form onSubmit={handleNewKeywordSubmit}>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Enter keyword"
          />
          <select value={direction} onChange={(e) => setDirection(e.target.value)}>
            <option value="i">Include</option>
            <option value="e">Exclude</option>
          </select>
          <label>
            Default:
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
          </label>
          <button type="submit">Create Keyword</button>
        </form>
        {keywords.map((keyword) => (
          <div key={keyword.id}>
            {editingKeyword === keyword ? (
              <form>
                <input
                  type="text"
                  name="word"
                  value={editedKeyword.word}
                  onChange={handleInputChange}
                />
                <select
                  name="category"
                  value={editedKeyword.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                <select
                  name="direction"
                  value={editedKeyword.direction}
                  onChange={handleInputChange}
                >
                  <option value="i">Include</option>
                  <option value="e">Exclude</option>
                </select>
                <label>
                  Default:
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={editedKeyword.is_default}
                    onChange={handleInputChange}
                  />
                </label>
                <button type="button" onClick={handleEditSubmit}>Update</button>
                <button type="button" onClick={handleEditCancel}>Cancel</button>
              </form>
            ) : (
              <>
                <p>
                  <span>{keyword.category_name}: </span>
                  <span>{keyword.word} </span>
                  <span>[{keyword.direction}] </span>
                  {keyword.is_default && (<span>default</span>)}
                  <button onClick={() => handleEditKeyword(keyword)}>Edit</button>
                  <button onClick={() => handleDeleteKeyword(keyword)}>Delete</button>
                  {deletingKeyword === keyword && (
                    <>
                      <span>Are you sure you want to delete {deletingKeyword && deletingKeyword.word}?</span>
                      <button onClick={handleDeleteConfirm}>Confirm</button>
                      <button onClick={handleCancelDelete}>Cancel</button>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        ))}
    </>
  )
}
