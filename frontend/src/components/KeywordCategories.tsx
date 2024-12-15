import { useEffect, useCallback } from "react";
import useCategoryFormStore from "../stores/CategoryFormStore";
import useApi from "../hooks/api";

export type KeyWordCategoryType = {
  id: number;
  name: string
}

export default function KeywordCategories() {

  const { get, post, put, del } = useApi();

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

  const handleNewCategorySubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
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

  const handleEditCategory = (category: KeyWordCategoryType) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return
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

  const handleDeleteCategory = (category: KeyWordCategoryType) => {
    setDeletingCategory(category);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return
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
      <table className="keyword-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>
              {createCategory === false && (
                <button onClick={handleShowCreateForm}>Add</button>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {createCategory === true && (
            <tr>
              <td>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                />
              </td>
              <td>
                <button onClick={handleNewCategorySubmit}>Create Category</button>
                <button onClick={handleCancelCreate}>Cancel</button>
              </td>
            </tr>
          )}
          {categories.map((category) => (
            <tr key={category.id}>
              {editingCategory === category ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={editedCategoryName}
                      onChange={(e) => setEditedCategoryName(e.target.value)}
                    />
                  </td>
                  <td>
                    <button onClick={handleUpdateCategory}>Update</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{category.name}</td>
                  <td>
                    {deletingCategory === category ? (
                      <>
                        <button onClick={handleDeleteConfirm}>Confirm</button>
                        <button onClick={handleCancelDelete}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditCategory(category)}>Edit</button>
                        <button onClick={() => handleDeleteCategory(category)}>Delete</button>
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
