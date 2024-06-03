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

    put(`tv/show/${showDetail.id}/`, { search_name: editedSearchName })
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

  const handleOptionUpdate = async () => {
    if (selectedOption) {
      await patch(`tv/show/${showDetail.id}/?direction=add`, { search_keywords: [selectedOption]});
      setSelectedOption('');
      fetchShow();
    }
  };

  const handleKeywordRemove = async (event) => {
    const keywordId = event.target.id;
    await patch(`tv/show/${showDetail.id}/?direction=remove`, { search_keywords: [keywordId]})
    fetchShow();
  }

  const handleSearchNameCancel = () => {
    setEditedSearchName(showDetail.search_name || '');
    setEditMode(false);
  }

  const handleActiveToggle = () => {
    put(`tv/show/${showDetail.id}/`, { is_active: !showDetail.is_active })
      .catch(error => {
        console.error('Error:', error);
      });
    fetchShow();
  }

  const getShowPoster = (showDetail) => {
    if (showDetail.image_show?.image) return showDetail.image_show
    return {image: '/poster-default.jpg'}
  }

  return (
    <div className="show-detail">
      <div className="show-detail-header">
        <div className="show-poster">
          <ImageComponent image={getShowPoster(showDetail)} alt='show-poster' />
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
        {showConfigure ? "Hide" : "Configure Show"}
      </button>
      {showConfigure && (
        <>
          <table className="keyword-table">
            <tbody>
              <tr>
                <td>Active</td>
                <td>
                  <input
                    type="checkbox"
                    checked={showDetail.is_active}
                    onChange={handleActiveToggle}
                  />
                </td>
              </tr>
              <tr>
                <td>Search Name</td>
                <td>
                  {editMode ? (
                    <>
                      <input type="text" value={editedSearchName || ''} onChange={handleSearchNameChange} />
                      <button onClick={handleSearchNameSubmit}>Submit</button>
                      <button onClick={handleSearchNameCancel}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <span>{showDetail.search_name || ""}{" "}</span>
                      <button onClick={() => setEditMode(true)}>Edit</button>
                    </>
                  )}
                </td>
              </tr>
              <tr>
                <td>Add Keyword</td>
                <td>
                {allKeywords && (
                  <div>
                    <select onChange={handleOptionSelect} defaultValue={''}>
                      <option value="">---</option>
                      {allKeywords.map(keyword => (
                        <option key={keyword.id} value={keyword.id}>
                          {keyword.category_name} [{keyword.direction}] {keyword.word}
                        </option>
                      ))}
                    </select>
                    {selectedOption && <button onClick={handleOptionUpdate}>Add</button>}
                  </div>
                )}
                </td>
              </tr>
            </tbody>
          </table>
          <table className="keyword-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Keyword</th>
                <th>Direction</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {showDetail.all_keywords.map((keyword) => (
                <tr key={keyword.id}>
                  <td>{keyword.category_name}</td>
                  <td>{keyword.word}</td>
                  <td>{keyword.direction_display}</td>
                  <td>
                    {keyword.tv_default ? (
                      'default'
                    ) : (
                      <button id={keyword.id} onClick={handleKeywordRemove}>remove</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
