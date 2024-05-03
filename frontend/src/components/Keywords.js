import { useEffect, useCallback, useState } from "react";
import useCategoryFormStore from "../stores/CategoryFormStore";
import useSearchKeyWordStore from "../stores/SearchKeyWordsStore";
import useApi from "../hooks/api";

export default function Keywords() {

  const { get, post, put, del } = useApi();

  const { categories } = useCategoryFormStore();
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
    const data = await get('keyword/');
    setKeywords(data);
  }, [setKeywords]);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  const resetFormDefaults = () => {
    setNewKeyword("");
    setSelectedCategory("");
    setDirection("i");
    setIsDefault(false);
  }

  const handleNewKeywordSubmit = async (event) => {
    event.preventDefault();
    try {
      const body = {
        category: selectedCategory,
        word: newKeyword,
        direction: direction,
        is_default: isDefault,
      }
      const data = await post('keyword/', body);
      if (data) {
        resetFormDefaults();
        setCreateKeyword(false);
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
      const data = await del(`keyword/${deletingKeyword.id}/`);
      if (data) {
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
      const data = await put(`keyword/${editingKeyword.id}/`, editedKeyword);
      if (data) {
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

  const handleShowAddForm = () => {
    setCreateKeyword(true);
  }

  const handleCancelCreate = () => {
    setCreateKeyword(false);
    resetFormDefaults();
  }

  return (
    <>
      <h2>Search Key Words</h2>
      {createKeyword === true ? (
        <>
          <h3>Create New Keyword</h3>
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
            <button onClick={handleCancelCreate}>Cancel</button>
          </form>
        </>
      ) : (
        <button onClick={handleShowAddForm}>Add</button>
      )}
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
