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
    isDefaultTV,
    setIsDefaultTV,
    isDefaultMovie,
    setIsDefaultMovie,
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
    setIsDefaultTV(false);
    setIsDefaultMovie(false);
  }

  const handleNewKeywordSubmit = async (event) => {
    event.preventDefault();
    try {
      const body = {
        category: selectedCategory,
        word: newKeyword,
        direction: direction,
        movie_default: isDefaultMovie,
        tv_default: isDefaultTV,
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
      movie_default: keyword.movie_default,
      tv_default: keyword.tv_default,
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
      <table className="keyword-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Keyword</th>
            <th>Direction</th>
            <th>Default TV</th>
            <th>Default Movie</th>
            <th>
              {createKeyword == false && (
                <button onClick={handleShowAddForm}>Add</button>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {createKeyword === true && (
            <tr>
              <td>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Enter keyword"
                />
              </td>
              <td>
                <select value={direction} onChange={(e) => setDirection(e.target.value)}>
                  <option value="i">Include</option>
                  <option value="e">Exclude</option>
                </select>
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={isDefaultTV}
                  onChange={(e) => setIsDefaultTV(e.target.checked)}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={isDefaultMovie}
                  onChange={(e) => setIsDefaultMovie(e.target.checked)}
                />
              </td>
              <td>
                <button onClick={handleNewKeywordSubmit}>Create Keyword</button>
                <button onClick={handleCancelCreate}>Cancel</button>
              </td>
            </tr>
          )}
          {keywords.map((keyword) => (
            <tr key={keyword.id}>
              {editingKeyword === keyword ? (
                <>
                  <td>
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
                  </td>
                  <td>
                    <input
                      type="text"
                      name="word"
                      value={editedKeyword.word}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <select
                      name="direction"
                      value={editedKeyword.direction}
                      onChange={handleInputChange}
                    >
                      <option value="i">Include</option>
                      <option value="e">Exclude</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      name="tv_default"
                      checked={editedKeyword.tv_default}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      name="movie_default"
                      checked={editedKeyword.movie_default}
                      onChange={handleInputChange}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={handleEditSubmit}>Update</button>
                    <button type="button" onClick={handleEditCancel}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{keyword.category_name}</td>
                  <td>{keyword.word} </td>
                  <td>{keyword.direction_display}</td>
                  <td>{keyword.tv_default ? ('✅') : ('-')}</td>
                  <td>{keyword.movie_default ? ('✅') : ('-')}</td>
                  <td>
                    {deletingKeyword === keyword ? (
                      <>
                        <button onClick={handleDeleteConfirm}>Confirm</button>
                        <button onClick={handleCancelDelete}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditKeyword(keyword)}>Edit</button>
                        <button onClick={() => handleDeleteKeyword(keyword)}>Delete</button>
                      </>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
