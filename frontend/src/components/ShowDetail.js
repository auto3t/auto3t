import { useState } from "react";
import ImageComponent from "./ImageComponent";
import useApi from "../hooks/api";
import TimeComponent from "./TimeComponent";

export default function ShowDetail({ showDetail, fetchShow }) {

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
    .then(() => {
      fetchShow();
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
      fetchShow();
    }
  };

  const handleKeywordRemove = async (event) => {
    const keywordId = event.target.id;
    await patch(`show/${showDetail.id}/?direction=remove`, { search_keywords: [keywordId]})
    fetchShow();
  }

  const handleSearchNameCancel = () => {
    setEditedSearchName(showDetail.search_name || '');
    setEditMode(false);
  }

  const handleActiveToggle = () => {
    put(`show/${showDetail.id}/`, { is_active: !showDetail.is_active })
      .catch(error => {
        console.error('Error:', error);
      });
    fetchShow();
  }

  return (
    <div className="show-detail">
      <div className="show-detail-header">
        <div className="show-poster">
          <ImageComponent image={showDetail.image_show} alt='show-poster' />
        </div>
        <div className="show-description">
          <h1>{showDetail.name}</h1>
          <span className='smaller'>ID: <a href={showDetail.remote_server_url} target='_blank' rel='noreferrer'>{showDetail.remote_server_id}</a></span>
          <p dangerouslySetInnerHTML={{__html: showDetail.description}} />
          <div className='tag-group'>
            <span className="tag-item">Status: {showDetail.status_display}</span>
            {showDetail.release_date && <span className="tag-item">Start: <TimeComponent timestamp={showDetail.release_date} /></span>}
            {showDetail.end_date && <span className="tag-item">End: <TimeComponent timestamp={showDetail.end_date} /></span>}
          </div>
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
