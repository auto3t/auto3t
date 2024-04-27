import { useEffect, useCallback } from "react";
import useCategoryFormStore from "../stores/CategoryFormStore";
import { get, post, put, del } from "../api";

export default function KeywordCategories() {

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
    setEditedCategoryName
  } = useCategoryFormStore()

  const fetchCategories = useCallback(async () => {
    const data = await get('keyword-category/');
    setCategories(data);
  }, [setCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleNewCategorySubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await post('keyword-category/', { name: newCategoryName });
      if (data) {
        setNewCategoryName("");
        setCreateCategory(false);
        fetchCategories();
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
      const data = await put(`keyword-category/${editingCategory.id}/`, { name: editedCategoryName });
      if (data) {
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

  const handleDeleteCategory = (category) => {
    setDeletingCategory(category);
  };

  const handleDeleteConfirm = async () => {
    try {
      const data = await del(`keyword-category/${deletingCategory.id}/`);
      if (data) {
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

  const handleShowCreateForm = () => {
    setCreateCategory(true);
  }

  const handleCancelCreate = () => {
    setNewCategoryName('');
    setCreateCategory(false);
  };

  return (
    <>
      <h2>Categories</h2>
      {createCategory === true ? (
        <>
          <h3>Create New Category</h3>
          <form onSubmit={handleNewCategorySubmit}>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
            />
            <button type="submit">Create Category</button>
            <button onClick={handleCancelCreate}>Cancel</button>
          </form>
        </>
      ) : (
        <button onClick={handleShowCreateForm}>Add</button>
      )}
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
    </>
  )
}
