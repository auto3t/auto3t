import { useEffect, useCallback } from "react";
import useSearchKeyWordStore from "../stores/SearchKeyWordsStore";
import useCategoryFormStore from "../stores/CategoryFormStore";

export default function Settings() {
  const { keywords, categories, setKeywords, setCategories } = useSearchKeyWordStore();
  const {
    newCategoryName,
    selectedCategory,
    showDeleteConfirmation,
    setNewCategoryName,
    setSelectedCategory,
    setShowDeleteConfirmation,
  } = useCategoryFormStore();

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
      if (!selectedCategory) {
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
      } else {
        const res = await fetch(`http://localhost:8000/api/keyword-category/${selectedCategory.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newCategoryName }),
        });
        if (res.ok) {
          setNewCategoryName("");
          setSelectedCategory(null);
          fetchCategories();
        } else {
          console.error('Failed to update category');
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCategoryEdit = (category) => {
    setNewCategoryName(category.name);
    setSelectedCategory(category);
  };

  const handleDeleteCategory = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/keyword-category/${selectedCategory.id}/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCategories();
        setSelectedCategory(null);
        setShowDeleteConfirmation(false);
      } else {
        console.error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="settings">
      <h1>Settings</h1>
      <h2>Create/Update Category</h2>
      <form onSubmit={handleNewCategorySubmit}>
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Enter category name"
        />
        <button type="submit">{selectedCategory ? "Update" : "Create"} Category</button>
      </form>
      <h2>Categories</h2>
      {categories.map((category) => (
        <div key={category.id}>
          <p>
            {category.name}
            <button onClick={() => handleCategoryEdit(category)}>Edit</button>
            <button onClick={() => { setSelectedCategory(category); setShowDeleteConfirmation(true); }}>Delete</button>
          </p>
        </div>
      ))}
      {showDeleteConfirmation && (
        <div>
          <p>Are you sure you want to delete {selectedCategory?.name}?</p>
          <button onClick={handleDeleteCategory}>Yes</button>
          <button onClick={() => setShowDeleteConfirmation(false)}>No</button>
        </div>
      )}
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
