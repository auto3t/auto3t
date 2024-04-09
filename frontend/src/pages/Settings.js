import { useState, useEffect, useCallback } from "react";
import useSearchKeyWordStore from "../stores/SearchKeyWordsStore";

export default function Settings() {
  const { keywords, categories, setKeywords, setCategories } = useSearchKeyWordStore();
  const [newCategoryName, setNewCategoryName] = useState("");

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
        <div key={category.name}>
          <p>{category.name}</p>
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
