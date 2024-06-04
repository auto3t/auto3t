import { useEffect, useState } from "react";
import useApi from "../hooks/api";

const AddKeywordComponent = ({ patchURL, refreshCallback }) => {

  const { get, patch } = useApi();
  const [allKeywords, setAllKeywords] = useState(null);
  const [selectedOption, setSelectedOption] = useState();

  useEffect(() => {
    const getKeywords = () => {
      get('keyword/')
      .then(response => {
        setAllKeywords(response);
      })
    }
    getKeywords();
  }, [patchURL])

  const handleOptionSelect = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleOptionUpdate = async () => {
    if (selectedOption) {
      await patch(patchURL, { search_keywords: [selectedOption]});
      setSelectedOption('');
      refreshCallback();
    }
  };

  return (
    <>
      {allKeywords && (
        <>
          <select onChange={handleOptionSelect} defaultValue={''}>
            <option value="">---</option>
            {allKeywords.map(keyword => (
              <option key={keyword.id} value={keyword.id}>
                {keyword.category_name} [{keyword.direction}] {keyword.word}
              </option>
            ))}
          </select>
          {selectedOption && <button onClick={handleOptionUpdate}>Add</button>}
        </>
      )}
    </>
  )
}

export default AddKeywordComponent;
