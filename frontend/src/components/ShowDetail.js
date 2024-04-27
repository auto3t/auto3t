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
        {showShowDetails ? "Hide" : "Configure"}
      </button>
      {showShowDetails && (
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
        </div>
      )}
    </div>
  )
}
