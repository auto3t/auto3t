import { useState } from "react";
import ImageComponent from "./ImageComponent";
import useApi from "../hooks/api";

export default function ShowDetail({ showDetail, setShowDetail }) {

  const { get, put, patch } = useApi();
  const [showConfigure, setShowConfigure] = useState(false);
  const [editedSearchName, setEditedSearchName] = useState('');
  const [allKeywords, setAllKeywords] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedOption, setSelectedOption] = useState();

  const handleGetKeywords = async () => {
    get('keyword/')
    .then(response => {
      setAllKeywords(response);
    })
  }

  const toggleShowDetails = () => {
    setShowConfigure(!showConfigure);
    setEditedSearchName(showDetail.search_name || '');
    setEditMode(false);
    if (!showConfigure) {
      handleGetKeywords();
    }
  }

  const handleSearchNameChange = (event) => {
    setEditedSearchName(event.target.value);
  }

  const handleSearchNameSubmit = (event) => {
    event.preventDefault();

    put(`show/${showDetail.id}/`, { search_name: editedSearchName })
    .then(response => {
      showDetail.search_name = response.search_name;
      setShowDetail(showDetail);
      setEditMode(false);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  const handleOptionSelect = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleOptionUpdate = () => {
    if (selectedOption) {
      patch(`show/${showDetail.id}/?direction=add`, { search_keywords: [selectedOption]});
      setSelectedOption(null);
      handleGetKeywords();
    }
  };

  const handleKeywordRemove = async (event) => {
    const keywordId = event.target.id;
    await patch(`show/${showDetail.id}/?direction=remove`, { search_keywords: [keywordId]})
    handleGetKeywords();
  }

  const handleSearchNameCancel = () => {
    setEditedSearchName(showDetail.search_name || '');
    setEditMode(false);
  }

  const handleActiveToggle = () => {
    setShowDetail({ ...showDetail, is_active: !showDetail.is_active });
    put(`show/${showDetail.id}/`, { is_active: !showDetail.is_active })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  return (
    <div className="show-detail">
      <div className="show-detail-header">
        <div className="show-poster">
          <ImageComponent imagePath={showDetail.image} alt='show-poster' />
        </div>
        <div className="show-description">
          <h1>{showDetail.name}</h1>
          <span className='smaller'>ID: {showDetail.remote_server_id}</span>
          <p dangerouslySetInnerHTML={{__html: showDetail.description}} />
        </div>
      </div>
      <button onClick={toggleShowDetails}>
        {showConfigure ? "Hide" : "Configure"}
      </button>
      {showConfigure && (
        <div>
          <h3>Configure Show</h3>
            <div>
              <span>Overwrite Search Name: </span>
              {editMode ? (
                <>
                  <input type="text" value={editedSearchName || ''} onChange={handleSearchNameChange} />
                  <button onClick={handleSearchNameSubmit}>Submit</button>
                  <button onClick={handleSearchNameCancel}>Cancel</button>
                </>
              ) : (
                <>
                  <span>{showDetail.search_name || "none"}{" "}</span>
                  <button onClick={() => setEditMode(true)}>Edit</button>
                </>
              )}
            </div>
          <div>
            <label>Active</label>
            <input
              type="checkbox"
              checked={showDetail.is_active}
              onChange={handleActiveToggle}
            />
          </div>
          <div>
            <label>Search Words</label>
            {showDetail.all_keywords.map((keyword) => (
              <p key={keyword.id}>
                <span>{keyword.category_name}: {keyword.word} </span>
                {keyword.is_default ? (
                  <span>default</span>
                ) : (
                  <button id={keyword.id} onClick={handleKeywordRemove}>remove</button>
                )}
              </p>
            ))}
            <label>Add Keyword</label>
            {allKeywords && (
              <div>
                <label>Select an option:</label>
                <select onChange={handleOptionSelect} defaultValue={''}>
                  <option value="">---</option>
                  {allKeywords.map(keyword => (
                    <option key={keyword.id} value={keyword.id}>
                      {keyword.category_name}: {keyword.word}
                    </option>
                  ))}
                </select>
                {selectedOption && <button onClick={handleOptionUpdate}>Set</button>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
