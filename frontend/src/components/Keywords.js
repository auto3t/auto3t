import { useEffect, useCallback } from "react";
import useCategoryFormStore from "../stores/CategoryFormStore";
import useSearchKeyWordStore from "../stores/SearchKeyWordsStore"; 

export default function Keywords() {

  const { categories } = useCategoryFormStore();
  const {
    keywords,
    setKeywords,
    newKeyword,
    setNewKeyword,
    selectedCategory,
    setSelectedCategory,
    direction,
    setDirection,
    isDefault,
    setIsDefault,
  } = useSearchKeyWordStore();

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
          direction: direction === "include" ? "i" : "e",
          is_default: isDefault,
        }),
      });
      if (res.ok) {
        setNewKeyword("");
        setSelectedCategory("");
        setDirection("include");
        setIsDefault(false);
        fetchKeywords();
      } else {
        console.error('Failed to create keyword');
      }
    } catch (error) {
      console.error('Error creating keyword:', error);
    }
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
            <option value="include">Include</option>
            <option value="exclude">Exclude</option>
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
            <p>
              <span>{keyword.category_name}: </span>
              <span>{keyword.word} </span>
              <span>[{keyword.direction}] </span>
              <span>default: {keyword.is_default}</span>
            </p>
          </div>
        ))}
    </>
  )
}
