import { useEffect } from "react";
import useSearchKeyWordStore from "../stores/SearchKeyWordsStore"

export default function Settings() {

  const { keywords, categories, setKeywords, setCategories } = useSearchKeyWordStore();

  useEffect(() => {
    const fetchKeywords = async () => {
      const res = await fetch('http://localhost:8000/api/keyword/');
      const data = await res.json();
      setKeywords(data.results);
    };
    fetchKeywords();
  }, [setKeywords]);

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch('http://localhost:8000/api/keyword-category/');
      const data = await res.json();
      setCategories(data.results);
    };
    fetchCategories();
  }, [setCategories]);

  return (
    <div className="settings">
      <h1>Settings</h1>
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
  )
}
