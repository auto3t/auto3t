import { useEffect, useCallback } from "react";
import useSearchKeyWordStore from "../stores/SearchKeyWordsStore";
import useCategoryFormStore from "../stores/CategoryFormStore";

export default function Settings() {

  const {
    categories,
    setCategories,
    newCategoryName,
    setNewCategoryName,
    deletingCategory,
    setDeletingCategory,
    editingCategory,
    setEditingCategory,
    editedCategoryName,
    setEditedCategoryName
  } = useCategoryFormStore()

  const {
    keywords,
    setKeywords,
  } = useSearchKeyWordStore();

  useEffect(() => {
    const fetchKeywords = async () => {
      const res = await fetch('http://localhost:8000/api/keyword/');
      const data = await res.json();
      setKeywords(data.results);
    };
    fetchKeywords();
  }, [setKeywords]);

  const fetchCategories = useCallback(async () => {
    const res = await fetch('http://localhost:8000/api/keyword-category/');
    const data = await res.json();
    setCategories(data.results);
  }, [setCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleNewCategorySubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/keyword-category/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (res.ok) {
        setNewCategoryName("");
        fetchCategories();
      } else {
        console.error('Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
  };

  const handleUpdateCategory = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/keyword-category/${editingCategory.id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editedCategoryName }),
      });
      if (res.ok) {
        setEditingCategory(null);
        fetchCategories();
      } else {
        console.error('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditedCategoryName("");
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/keyword-category/${deletingCategory.id}/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setDeletingCategory(null);
        fetchCategories();
      } else {
        console.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleCancelDelete = () => {
    setDeletingCategory(null);
  };

  const handleDeleteCategory = (category) => {
    setDeletingCategory(category);
  };

  return (
    <div className="settings">
      <h1>Settings</h1>
      <h2>Create New Category</h2>
      <form onSubmit={handleNewCategorySubmit}>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Enter category name"
        />
        <button type="submit">Create Category</button>
      </form>
      <h2>Categories</h2>
      {categories.map((category) => (
        <div key={category.id}>
          {editingCategory === category ? (
            <div>
              <input
                type="text"
                value={editedCategoryName}
                onChange={(e) => setEditedCategoryName(e.target.value)}
              />
              <button onClick={handleUpdateCategory}>Update</button>
              <button onClick={handleCancelEdit}>Cancel</button>
            </div>
          ) : (
            <div>
              <span>{category.name}</span>
              <button onClick={() => handleEditCategory(category)}>Edit</button>
              <button onClick={() => handleDeleteCategory(category)}>Delete</button>
              {deletingCategory === category && (
                <>
                  <span>Are you sure you want to delete {deletingCategory && deletingCategory.name}?</span>
                  <button onClick={handleDeleteConfirm}>Confirm</button>
                  <button onClick={handleCancelDelete}>Cancel</button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
      <h2>Search Key Words</h2>
      {keywords.map((keyword) => (
        <div key={keyword.id}>
          <p>
            <span>{keyword.category_name}: </span>
            <span>{keyword.word} </span>
            <span>[{keyword.direction}] </span>
            <span>default: {keyword.is_default}</span>
          </p>
        </div>
      ))}
    </div>
  );
}
