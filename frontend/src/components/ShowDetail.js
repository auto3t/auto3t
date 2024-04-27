import { useState } from "react";
import ImageComponent from "./ImageComponent";
import { put } from "../api";

export default function ShowDetail({ showDetail, setShowDetail }) {

  const [showShowDetails, setShowDetails] = useState(false);
  const [editedSearchName, setEditedSearchName] = useState('');
  const [editMode, setEditMode] = useState(false);

  const toggleShowDetails = () => {
    setShowDetails(!showShowDetails);
    setEditedSearchName(showDetail.search_name || '');
    setEditMode(false);
  }

  const handleSearchNameChange = (event) => {
    setEditedSearchName(event.target.value);
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    put(`show/${showDetail.id}/`, { search_name: editedSearchName })
    .then(response => {
      showDetail.search_name = response.search_name;
      setShowDetail(showDetail.search_name = response.search_name);
      setEditMode(false);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  const handleCancel = () => {
    setEditedSearchName(showDetail.search_name || '');
    setEditMode(false);
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
        {showShowDetails ? "Hide" : "Configure"}
      </button>
      {showShowDetails && (
        <div>
          <h3>Configure Show</h3>
          {editMode ? (
            <form onSubmit={handleSubmit}>
              <label>
                New Search Name:
                <input type="text" value={editedSearchName} onChange={handleSearchNameChange} />
              </label>
              <button type="submit">Submit</button>
              <button type="button" onClick={handleCancel}>Cancel</button>
            </form>
          ) : (
            <p>Search Name: {showDetail.search_name || "none"} <button onClick={() => setEditMode(true)}>Edit</button></p>
          )}
        </div>
      )}
    </div>
  )
}
